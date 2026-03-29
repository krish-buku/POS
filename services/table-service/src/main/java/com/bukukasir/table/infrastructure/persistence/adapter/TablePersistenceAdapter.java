package com.bukukasir.table.infrastructure.persistence.adapter;

import com.bukukasir.table.domain.model.RestaurantTable;
import com.bukukasir.table.domain.model.TableStatus;
import com.bukukasir.table.domain.port.out.TableRepository;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TablePersistenceAdapter implements TableRepository {

    private final Map<String, RestaurantTable> store = new ConcurrentHashMap<>();

    public TablePersistenceAdapter() {
        initMockData();
    }

    private void initMockData() {
        store.put("table-001", RestaurantTable.builder().id("table-001").name("T1").capacity(4).status(TableStatus.OCCUPIED).areaId("area-001").floorId("floor-001").businessId("biz-001").currentOrderId("order-001").build());
        store.put("table-002", RestaurantTable.builder().id("table-002").name("T2").capacity(4).status(TableStatus.AVAILABLE).areaId("area-001").floorId("floor-001").businessId("biz-001").build());
        store.put("table-003", RestaurantTable.builder().id("table-003").name("T3").capacity(6).status(TableStatus.OCCUPIED).areaId("area-001").floorId("floor-001").businessId("biz-001").currentOrderId("order-002").build());
        store.put("table-004", RestaurantTable.builder().id("table-004").name("T4").capacity(2).status(TableStatus.RESERVED).areaId("area-001").floorId("floor-001").businessId("biz-001").build());
        store.put("table-005", RestaurantTable.builder().id("table-005").name("T5").capacity(4).status(TableStatus.AVAILABLE).areaId("area-002").floorId("floor-001").businessId("biz-001").build());
        store.put("table-006", RestaurantTable.builder().id("table-006").name("T6").capacity(8).status(TableStatus.OCCUPIED).areaId("area-002").floorId("floor-001").businessId("biz-001").currentOrderId("order-003").build());
        store.put("table-007", RestaurantTable.builder().id("table-007").name("T7").capacity(4).status(TableStatus.CLEANING).areaId("area-002").floorId("floor-001").businessId("biz-001").build());
        store.put("table-008", RestaurantTable.builder().id("table-008").name("T8").capacity(6).status(TableStatus.AVAILABLE).areaId("area-002").floorId("floor-001").businessId("biz-001").build());
    }

    @Override public List<RestaurantTable> findAll() { return new ArrayList<>(store.values()); }
    @Override public Optional<RestaurantTable> findById(String id) { return Optional.ofNullable(store.get(id)); }
    @Override public RestaurantTable save(RestaurantTable table) { store.put(table.getId(), table); return table; }
    @Override public void deleteById(String id) { store.remove(id); }
}
