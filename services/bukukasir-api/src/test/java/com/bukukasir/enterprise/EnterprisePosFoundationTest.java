package com.bukukasir.enterprise;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
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
    void enterpriseConstraintsRejectInvalidModifierBoundsAndNegativePayments() {
        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO modifier_groups
                (id, business_id, name, required, min_select, max_select, allow_quantity, active, sort_order, created_at, updated_at)
                VALUES ('mg-bad-bounds', 'biz-001', 'Bad bounds', FALSE, 3, 1, FALSE, TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """)).hasMessageContaining("chk_modifier_groups_bounds");

        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO payment_allocations (id, payment_id, order_id, amount, created_at)
                VALUES ('alloc-bad-negative', 'pay-001', 'order-001', -1, CURRENT_TIMESTAMP)
                """)).hasMessageContaining("chk_payment_allocations_amount");
    }

    @Test
    void backofficeCanConfigureChannelPriceBookInventoryAndMarketplaceOrder() throws Exception {
        mockMvc.perform(post("/api/channels")
                        .contentType("application/json")
                        .content("""
                                {
                                  "businessId": "biz-001",
                                  "code": "GRAB",
                                  "name": "GrabFood",
                                  "channelType": "GRAB",
                                  "enabled": true,
                                  "autoAccept": false
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.code").value("GRAB"));

        String channelId = jdbc.queryForObject("SELECT id FROM sales_channels WHERE code = 'GRAB'", String.class);

        mockMvc.perform(post("/api/price-books")
                        .contentType("application/json")
                        .content("""
                                {
                                  "businessId": "biz-001",
                                  "channelId": "%s",
                                  "name": "GrabFood Prices",
                                  "serviceType": "DELIVERY",
                                  "priority": 100,
                                  "active": true
                                }
                                """.formatted(channelId)))
                .andExpect(status().isCreated());

        String priceBookId = jdbc.queryForObject("SELECT id FROM price_books WHERE channel_id = ?", String.class, channelId);

        mockMvc.perform(post("/api/price-books/%s/entries".formatted(priceBookId))
                        .contentType("application/json")
                        .content("""
                                {
                                  "businessId": "biz-001",
                                  "itemType": "MENU_ITEM",
                                  "itemId": "menu-001",
                                  "price": 30000,
                                  "active": true
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/pricing/quote")
                        .contentType("application/json")
                        .content("""
                                {
                                  "businessId": "biz-001",
                                  "channelId": "%s",
                                  "serviceType": "DELIVERY",
                                  "items": [{ "menuItemId": "menu-001", "quantity": 2, "modifiers": [] }]
                                }
                                """.formatted(channelId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.channelId").value(channelId))
                .andExpect(jsonPath("$.data.lines[0].basePrice").value(30000.00))
                .andExpect(jsonPath("$.data.subtotal").value(60000.00));

        mockMvc.perform(post("/api/price-books")
                        .contentType("application/json")
                        .content("""
                                {
                                  "businessId": "biz-001",
                                  "channelId": "%s",
                                  "name": "GrabFood Dinner Prices",
                                  "serviceType": "DELIVERY",
                                  "daypartName": "Dinner",
                                  "startTime": "17:00",
                                  "endTime": "22:00",
                                  "daysOfWeek": "MON,TUE,WED,THU,FRI,SAT,SUN",
                                  "priority": 200,
                                  "active": true
                                }
                                """.formatted(channelId)))
                .andExpect(status().isCreated());

        String dinnerPriceBookId = jdbc.queryForObject("""
                SELECT id FROM price_books WHERE channel_id = ? AND daypart_name = 'Dinner'
                """, String.class, channelId);

        mockMvc.perform(post("/api/price-books/%s/entries".formatted(dinnerPriceBookId))
                        .contentType("application/json")
                        .content("""
                                {
                                  "businessId": "biz-001",
                                  "itemType": "MENU_ITEM",
                                  "itemId": "menu-001",
                                  "price": 35000,
                                  "active": true
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/pricing/quote")
                        .contentType("application/json")
                        .content("""
                                {
                                  "businessId": "biz-001",
                                  "channelId": "%s",
                                  "serviceType": "DELIVERY",
                                  "orderTime": "2026-06-22T19:30:00",
                                  "items": [{ "menuItemId": "menu-001", "quantity": 1, "modifiers": [] }]
                                }
                                """.formatted(channelId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.lines[0].basePrice").value(35000.00));

        mockMvc.perform(post("/api/inventory/ingredients")
                        .contentType("application/json")
                        .content("""
                                {
                                  "businessId": "biz-001",
                                  "name": "Rice",
                                  "sku": "ING-RICE",
                                  "unit": "kg",
                                  "costPerUnit": 12000,
                                  "active": true
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/channels/%s/webhooks/orders".formatted(channelId))
                        .contentType("application/json")
                        .content("""
                                {
                                  "businessId": "biz-001",
                                  "externalEventId": "evt-grab-001",
                                  "externalOrderId": "grab-order-001",
                                  "externalOrderNumber": "GF-001",
                                  "serviceType": "DELIVERY",
                                  "customerName": "Grab Customer",
                                  "subtotal": 30000,
                                  "discountTotal": 0,
                                  "feeTotal": 0,
                                  "taxTotal": 0,
                                  "total": 30000,
                                  "rawPayload": "{\\"source\\":\\"test\\"}"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.external_order_id").value("grab-order-001"));
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
