package com.realestate.duediligence.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;
    private String type;
    private String message;
    private Boolean read;
    private LocalDateTime createdAt;
}
