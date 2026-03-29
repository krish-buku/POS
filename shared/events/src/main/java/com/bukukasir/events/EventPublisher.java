package com.bukukasir.events;

/**
 * Interface for publishing domain events.
 * Implementations can use message brokers (Kafka, RabbitMQ)
 * or simple in-process event dispatching.
 */
public interface EventPublisher {

    void publish(BaseEvent event);

    void publish(String topic, BaseEvent event);
}
