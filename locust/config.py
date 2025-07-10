"""
Configuration settings for Locust load tests
"""

# Default host for all tests
DEFAULT_HOST = "http://localhost:3000"

# Test configurations for different scenarios
CONFIGS = {
    "quick": {
        "users": 10,
        "spawn_rate": 2,
        "run_time": "30s",
        "description": "Quick test with 10 users over 30 seconds"
    },
    "standard": {
        "users": 50,
        "spawn_rate": 5,
        "run_time": "2m",
        "description": "Standard test with 50 users over 2 minutes"
    },
    "stress": {
        "users": 100,
        "spawn_rate": 10,
        "run_time": "5m",
        "description": "Stress test with 100 users over 5 minutes"
    },
    "endurance": {
        "users": 25,
        "spawn_rate": 1,
        "run_time": "10m",
        "description": "Endurance test with 25 users over 10 minutes"
    },
    "spike": {
        "users": 200,
        "spawn_rate": 50,
        "run_time": "1m",
        "description": "Spike test with 200 users ramping up quickly"
    }
}

# GraphQL queries for testing
GRAPHQL_QUERIES = {
    "getUser": "{ getUser }",
    "getProduct": "{ getProduct }",
    "getPayment": "{ getPayment }",
    "getUserPayment": "{ getUserPayment }"
}

# Headers for GraphQL requests
GRAPHQL_HEADERS = {
    "Content-Type": "application/json"
}

# Endpoint paths
ENDPOINTS = {
    "graphql": "/graphql",
    "rest": "/"
} 
