package com.bukukasir.enterprise;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:enterprise-pos-test;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=update"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EnterprisePosFoundationTest {

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void flywayCreatesEnterpriseFoundationTables() throws Exception {
        mockMvc.perform(get("/api/fnb/schema-health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("READY"));

        Integer modifierGroupTables = jdbc.queryForObject("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE LOWER(TABLE_NAME) = 'modifier_groups'
                """, Integer.class);
        Integer syncQueueTables = jdbc.queryForObject("""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE LOWER(TABLE_NAME) = 'sync_queue'
                """, Integer.class);

        assertThat(modifierGroupTables).isEqualTo(1);
        assertThat(syncQueueTables).isEqualTo(1);
    }

    @Test
    void pricingQuoteValidatesRequiredModifiersAndCalculatesDeltas() throws Exception {
        String groupId = "mg-test-required";
        String optionId = "mod-test-extra-egg";
        String linkId = "link-test-required";
        jdbc.update("""
                INSERT INTO modifier_groups
                (id, business_id, name, required, min_select, max_select, allow_quantity, active, sort_order, created_at, updated_at)
                VALUES (?, 'biz-001', 'Toppings', TRUE, 1, 2, TRUE, TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, groupId);
        jdbc.update("""
                INSERT INTO modifier_options
                (id, modifier_group_id, business_id, name, price_delta, default_quantity, affects_inventory, active, sort_order, created_at, updated_at)
                VALUES (?, ?, 'biz-001', 'Extra egg', ?, 0, FALSE, TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, optionId, groupId, new BigDecimal("2000.00"));
        jdbc.update("""
                INSERT INTO menu_item_modifier_groups
                (id, menu_item_id, modifier_group_id, active, sort_order)
                VALUES (?, 'menu-001', ?, TRUE, 1)
                """, linkId, groupId);

        mockMvc.perform(post("/api/pricing/quote")
                        .contentType("application/json")
                        .content("""
                                {
                                  "businessId": "biz-001",
                                  "items": [
                                    { "menuItemId": "menu-001", "quantity": 1, "modifiers": [] }
                                  ]
                                }
                                """))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/pricing/quote")
                        .contentType("application/json")
                        .content("""
                                {
                                  "businessId": "biz-001",
                                  "items": [
                                    {
                                      "menuItemId": "menu-001",
                                      "quantity": 1,
                                      "modifiers": [{ "optionId": "mod-test-extra-egg", "quantity": 1 }]
                                    }
                                  ],
                                  "orderDiscount": 0,
                                  "serviceCharge": 0
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.subtotal").value(27000.00))
                .andExpect(jsonPath("$.data.lines[0].modifierDelta").value(2000.00))
                .andExpect(jsonPath("$.data.total").value(27000.00));
    }
}
