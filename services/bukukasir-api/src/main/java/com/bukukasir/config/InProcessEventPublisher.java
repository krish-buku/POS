package com.bukukasir.config;

import com.bukukasir.events.BaseEvent;
import com.bukukasir.events.EventPublisher;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class InProcessEventPublisher implements EventPublisher {

    private final ApplicationEventPublisher springPublisher;

    public InProcessEventPublisher(ApplicationEventPublisher springPublisher) {
        this.springPublisher = springPublisher;
    }

    @Override
    public void publish(BaseEvent event) {
        event.initDefaults();
        springPublisher.publishEvent(event);
    }

    @Override
    public void publish(String topic, BaseEvent event) {
        publish(event);
    }
}
