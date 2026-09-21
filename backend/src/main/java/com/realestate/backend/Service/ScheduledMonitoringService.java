package com.realestate.backend.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.Property;
import com.realestate.backend.Entity.PropertyHistory;
import com.realestate.backend.Repository.PropertyHistoryRepository;

@Service
public class ScheduledMonitoringService {

    @Autowired
    private PropertyService propertyService;

    @Autowired
    private PropertyHistoryRepository propertyHistoryRepository;

    @Autowired
    private NotificationService notificationService;

    @Scheduled(fixedRate = 3600000)
    public void monitorProperties() {

        System.out.println("Scheduled property monitoring started.");

        List<Property> properties =
                propertyService.getAllProperties();

        for (Property property : properties) {

            List<PropertyHistory> historyList =
                    propertyHistoryRepository.findByPropertyId(property.getId());

            for (PropertyHistory history : historyList) {

                if (!history.isProcessed()) {

                    notificationService.createNotification(
                            property.getId(),
                            "test@example.com",
                            "PROPERTY_MONITORING",
                            "New property update detected for: "
                                    + property.getAddress()
                                    + ". Event: "
                                    + history.getEventType()
                    );

                    history.setProcessed(true);
                    propertyHistoryRepository.save(history);
                }
            }
        }

        System.out.println(
                "Scheduled property monitoring completed for "
                        + properties.size() + " properties."
        );
    }
}