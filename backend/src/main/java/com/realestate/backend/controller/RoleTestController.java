package com.realestate.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class RoleTestController {

    @GetMapping("/api/user/test")
    public String userTest() {
        return "USER authorization successful!";
    }

    @GetMapping("/api/agent/test")
    public String agentTest() {
        return "AGENT authorization successful!";
    }

    @GetMapping("/api/admin/test")
    public String adminTest() {
        return "ADMIN authorization successful!";
    }
}