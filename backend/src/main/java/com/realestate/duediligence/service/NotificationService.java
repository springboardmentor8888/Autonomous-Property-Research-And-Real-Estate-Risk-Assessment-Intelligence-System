package com.realestate.duediligence.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends email notifications — e.g. when a due-diligence report is
 * ready. Unlike the simulated registries, this is a genuinely real
 * integration, since email sending doesn't require special
 * government/institutional API access.
 */
@Service
public class NotificationService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    public NotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends a "your report is ready" notification email.
     */
    public void sendReportReadyNotification(String toEmail, Long propertyId, String propertyAddress) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Your Due Diligence Report is Ready");
        message.setText(
                "Your due diligence report for property #" + propertyId + " (" + propertyAddress + ") "
                + "has been generated and is ready for download.\n\n"
                + "- Real Estate Due Diligence Agent"
        );

        mailSender.send(message);
    }
}