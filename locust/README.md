# Locust Load Testing

This directory contains Locust load testing configuration for the NestJS GraphQL API. Locust complements the existing autocannon benchmarks with more advanced scenarios, better reporting, and realistic user behavior simulation.

## 🚀 Quick Start

### 1. Install Python Dependencies
```bash
# Install Locust and dependencies
npm run locust:install

# Or manually
pip install -r requirements.txt
```

### 2. Start Your NestJS Server
```bash
npm run start:dev
```

### 3. Run Load Tests

#### With Web UI (Recommended for beginners)
```bash
npm run locust:ui
```
Then open http://localhost:8089 in your browser to configure and start tests.

#### Headless Quick Tests
```bash
# Quick 30-second test
npm run locust:quick

# Standard 2-minute test
npm run locust:standard

# Stress test with 100 users
npm run locust:stress
```

## 📊 Test Scenarios

### 1. Single Query Performance (`single_query.py`)
- **Purpose**: Mirrors autocannon benchmarks with individual GraphQL queries
- **Characteristics**: Fast requests (0.1-0.5s between), focuses on raw performance
- **Use case**: Compare with autocannon results, measure pure query performance

```bash
npm run locust:single
```

## 🤖 AI-Powered Analysis

### OpenAI Summary Features
- **Query Rankings**: Automatically rank GraphQL queries by performance
- **Performance Analysis**: Detailed insights into bottlenecks and optimization opportunities
- **Scenario Comparison**: Compare different test scenarios and their implications
- **Autocannon Integration**: Compare Locust results with existing autocannon benchmarks

### Summary Commands
```bash
# Analyze latest test results
npm run locust:summary

# Analyze all test results
npm run locust:summary:all

# Rank queries by performance
npm run locust:summary:rank

# Compare with autocannon results
npm run locust:summary:compare
```

### 2. Realistic User Behavior (`realistic_user.py`)
- **Purpose**: Simulates real user workflows with thinking time
- **Characteristics**: 2-8 seconds between actions, complex user journeys
- **Use case**: Test realistic load patterns, user experience optimization

```bash
npm run locust:realistic
```

### 3. Stress Testing (`stress_test.py`)
- **Purpose**: High-load testing to find system limits
- **Characteristics**: Very fast requests (0.01-0.1s), burst patterns
- **Use case**: Capacity planning, bottleneck identification

```bash
npm run locust:stress
```

### 4. Main Mixed Scenarios (`locustfile.py`)
- **Purpose**: Comprehensive testing with multiple user types
- **Characteristics**: Mix of all above scenarios
- **Use case**: Overall system performance assessment

```bash
npm run locust:ui  # Use web UI for configuration
```

## 📋 Test Configurations

| Config | Users | Duration | Spawn Rate | Use Case |
|--------|-------|----------|------------|----------|
| `quick` | 10 | 30s | 2/sec | Quick validation |
| `standard` | 50 | 2m | 5/sec | Regular testing |
| `stress` | 100 | 5m | 10/sec | High load testing |
| `endurance` | 25 | 10m | 1/sec | Long-running stability |
| `spike` | 200 | 1m | 50/sec | Traffic spike simulation |

## 🎯 GraphQL Endpoints Tested

- **`getUser`**: User information retrieval
- **`getProduct`**: Product information retrieval
- **`getPayment`**: Payment information retrieval
- **`getUserPayment`**: User payment integration (request-scoped service)
- **REST `/`**: Hello World endpoint

## 🔧 Advanced Usage

### Custom Test Configuration
```bash
cd locust
python runner.py realistic --config stress --host http://localhost:3000
```

### Generate Test Reports for Development
```bash
cd locust
python test-report-generator.py
```

### Web UI with Custom Settings
```bash
cd locust
locust -f scenarios/realistic_user.py --host=http://localhost:3000
```

### Distributed Testing
```bash
# Master node
locust -f locustfile.py --master --host=http://localhost:3000

# Worker nodes (run on different machines)
locust -f locustfile.py --worker --master-host=<master-ip>
```

## 📈 Understanding Results

### Key Metrics
- **RPS**: Requests per second
- **Response Time**: Average, 95th, 99th percentiles
- **Error Rate**: Percentage of failed requests
- **Throughput**: Data transfer rate

### Comparing with Autocannon
- **Autocannon**: Raw performance, simple scenarios
- **Locust**: Realistic user behavior, complex workflows
- **Use Both**: Autocannon for baseline, Locust for real-world scenarios

## 🛠️ Customization

### Adding New Scenarios
1. Create new file in `locust/scenarios/`
2. Import base classes from `config.py`
3. Define your `HttpUser` subclass
4. Add `@task` decorated methods
5. Update `runner.py` to include your scenario

### Modifying Test Data
Edit `config.py` to:
- Add new GraphQL queries
- Modify test configurations
- Change default settings

## 🔍 Troubleshooting

### Common Issues

#### Locust not found
```bash
pip install locust
# or
npm run locust:install
```

#### Connection refused
- Ensure NestJS server is running: `npm run start:dev`
- Check the host in configuration matches your server

#### High error rates
- Reduce user count or spawn rate
- Check server logs for errors
- Verify GraphQL queries are valid

#### Python path issues
- Ensure you're running from the correct directory
- Check Python path in scripts

## 🔄 Integration with Existing Benchmarks

### Autocannon vs Locust Comparison
```bash
# Run both for comparison
npm run start:autocannon:user        # Autocannon
npm run locust:single               # Locust equivalent

# Compare results
npm run benchmark:summary           # AI summary of results
```

### Workflow Integration
1. **Development**: Use `locust:quick` for fast validation
2. **CI/CD**: Use `locust:standard` for regular testing
3. **Pre-deployment**: Use `locust:stress` for capacity validation
4. **Production monitoring**: Use `locust:endurance` for stability testing

## 📊 Output Files

- **HTML Reports**: `locust-report-{config}.html`
- **CSV Stats**: `locust-stats-{config}_stats.csv`
- **CSV Failures**: `locust-stats-{config}_failures.csv`
- **Terminal Output**: Real-time statistics
- **AI Analysis**: Generated summaries and rankings

## 🎨 Web UI Features

- **Real-time Charts**: RPS, response times, user count
- **Request Statistics**: Detailed breakdown by endpoint
- **Download Reports**: CSV and HTML formats
- **Live Configuration**: Adjust users and spawn rate during test

## 🧪 Best Practices

1. **Start Small**: Begin with quick tests, scale up gradually
2. **Monitor Resources**: Watch both client and server resources
3. **Realistic Scenarios**: Use realistic user behavior patterns
4. **Baseline First**: Establish baseline with autocannon
5. **Incremental Testing**: Test one change at a time
6. **Document Results**: Keep track of performance over time

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review Locust documentation: https://locust.io/
3. Ensure all dependencies are installed
4. Verify your NestJS server is running and accessible 
