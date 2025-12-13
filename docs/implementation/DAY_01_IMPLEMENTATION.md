# 📊 Day 1: Complete Monitoring Setup for Beginners

## 🤔 What is Monitoring and Why Do We Need It?

### The Problem Without Monitoring

Imagine you have a chat app with 1000 users. One day:
- Users complain "the app is slow"
- Some messages aren't sending
- The app crashes randomly

**Without monitoring, you're blind:**
- ❌ Don't know WHEN problems started
- ❌ Don't know WHAT caused them
- ❌ Don't know HOW MANY users are affected
- ❌ Can't predict problems before they happen

### The Solution: Monitoring Stack

**With monitoring, you become a detective:**
- ✅ See problems in real-time
- ✅ Get alerts before users complain
- ✅ Know exactly what's broken
- ✅ Track performance over time
- ✅ Make data-driven decisions

---

## 🏗️ What We're Building Today

### The Complete Monitoring Stack

```
Your Chat App → Prometheus → Grafana → You (Beautiful Dashboards)
     ↓              ↓           ↓
  Generates      Collects    Visualizes
   Metrics       & Stores     & Alerts
```

### 4 Key Components

#### 1. **Prometheus** (The Data Collector)
**What it does**: Collects numbers about your app every 15 seconds
**Think of it as**: A security camera recording everything 24/7

**Examples of what it tracks**:
- How many users are online right now?
- How fast are API requests?
- How much memory is your server using?
- How many messages were sent in the last hour?

#### 2. **Grafana** (The Dashboard)
**What it does**: Takes Prometheus data and makes beautiful charts
**Think of it as**: A TV showing live sports statistics

**What you'll see**:
- Real-time graphs of user activity
- Alerts when something goes wrong
- Historical trends (busy hours, growth patterns)

#### 3. **Node Exporter** (System Monitor)
**What it does**: Monitors your server's health (CPU, RAM, disk)
**Think of it as**: A doctor checking your server's vital signs

#### 4. **Your App Metrics** (Business Intelligence)
**What it does**: Tracks what matters to your business
**Examples**:
- Messages sent per minute
- Active chat rooms
- User registration rate

---

## 🎯 What You'll Achieve Today

### Before (Blind Operation)
```
User: "App is slow!"
You: "Hmm, let me check... everything looks fine?"
User: "It's been slow for 2 hours!"
You: "😰 I had no idea..."
```

### After (Data-Driven Operation)
```
Alert: "Response time > 2 seconds for 5 minutes"
You: "I see the problem - high CPU usage due to memory leak"
You: "Fixed! Response time back to 200ms"
User: "Wow, the app feels faster than ever!"
```

---

## 🚀 Step-by-Step Implementation

### Step 0: Prerequisites Check

**Do you have these installed?**
```bash
# Check Node.js
node --version  # Should show v16+ 

# Check Docker
docker --version  # Should show Docker version

# If Docker missing:
brew install --cask docker  # macOS
# Then start Docker Desktop app
```

### Step 1: Understanding the Metrics Code

**What are metrics?** Numbers that describe your app's behavior.

Let's look at the metrics we'll track:

```javascript
// This counts how many HTTP requests we get
const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',           // Metric name
  help: 'Total number of HTTP requests', // Description
  labelNames: ['method', 'route', 'status'] // Categories
});

// This measures how long requests take
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5] // Time ranges to measure
});
```

**Real-world example:**
```
When user sends message:
- httpRequestTotal increases by 1
- httpRequestDuration records it took 0.3 seconds
- Labels show: method=POST, route=/api/messages, status=200
```

### Step 2: Install Metrics Library

```bash
cd backend
npm install prom-client
```

**What this does**: Adds the ability to create and export metrics from your Node.js app.

### Step 3: Add Metrics to Your App

**Add this to `backend/src/index.js`:**

```javascript
// Import the metrics system
const { metricsMiddleware, metricsHandler, activeConnections, messagesSent } = require('./middleware/metrics');

// Track ALL HTTP requests automatically
app.use(metricsMiddleware);

// Create endpoint for Prometheus to read metrics
app.get('/metrics', metricsHandler);

// Track WebSocket connections (real-time chat)
io.on('connection', (socket) => {
  activeConnections.inc(); // +1 user connected
  
  socket.on('disconnect', () => {
    activeConnections.dec(); // -1 user disconnected
  });
  
  socket.on('sendMessage', () => {
    messagesSent.inc(); // +1 message sent
  });
});
```

**What this code does:**
1. **Middleware**: Automatically tracks every API call
2. **Metrics endpoint**: Lets Prometheus read the data
3. **WebSocket tracking**: Counts active users and messages

### Step 4: Start the Monitoring Stack

```bash
# Go to project root
cd /Users/abhishek/Chat-app-complete

# Start all monitoring services
docker compose -f monitoring/docker-compose.monitoring.yml up -d
```

**What happens behind the scenes:**
1. **Prometheus** starts on port 9090 (data collector)
2. **Grafana** starts on port 3000 (dashboard)
3. **Node Exporter** starts on port 9100 (system monitor)
4. All services connect to each other automatically

### Step 5: Verify Everything Works

**Check Prometheus (Data Collector):**
```bash
# Open in browser
open http://localhost:9090

# Or test with curl
curl http://localhost:9090/-/healthy
# Should return: Prometheus is Healthy.
```

**Check Grafana (Dashboard):**
```bash
# Open in browser
open http://localhost:3000
# Login: admin / admin
```

**Check Your App Metrics:**
```bash
# Start your chat app first
cd backend && npm run dev

# Then check metrics endpoint
curl http://localhost:5001/metrics
# Should show lots of metrics data
```

---

## 📊 Understanding Your Metrics

### System Metrics (From Node Exporter)

**CPU Usage:**
```promql
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```
- **Good**: < 70%
- **Warning**: 70-85%
- **Critical**: > 85%

**Memory Usage:**
```promql
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```
- **Good**: < 80%
- **Warning**: 80-90%
- **Critical**: > 90%

**Disk Usage:**
```promql
100 - ((node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100)
```
- **Good**: < 80%
- **Warning**: 80-90%
- **Critical**: > 90%

### Application Metrics (From Your Chat App)

**Request Rate (Requests per second):**
```promql
rate(http_requests_total[5m])
```
**What it tells you**: How busy your app is
- **Low traffic**: < 10 req/sec
- **Medium traffic**: 10-100 req/sec
- **High traffic**: > 100 req/sec

**Error Rate (Percentage of failed requests):**
```promql
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100
```
**What it tells you**: How many requests are failing
- **Healthy**: < 1%
- **Warning**: 1-5%
- **Critical**: > 5%

**Response Time (How fast your app responds):**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```
**What it tells you**: 95% of requests complete within X seconds
- **Fast**: < 0.5 seconds
- **Acceptable**: 0.5-2 seconds
- **Slow**: > 2 seconds

**Active WebSocket Connections:**
```promql
websocket_connections_active
```
**What it tells you**: How many users are online right now

**Messages Sent Rate:**
```promql
rate(messages_sent_total[5m])
```
**What it tells you**: How active your chat is (messages per second)

---

## 🎨 Creating Your First Dashboard in Grafana

### Step 1: Access Grafana
1. Go to http://localhost:3000
2. Login: `admin` / `admin`
3. Skip password change (for now)

### Step 2: Add Prometheus Data Source
1. Click "Configuration" (gear icon) → "Data Sources"
2. Click "Add data source"
3. Select "Prometheus"
4. URL: `http://prometheus:9090`
5. Click "Save & Test" (should show green checkmark)

### Step 3: Create Your First Dashboard
1. Click "+" → "Dashboard"
2. Click "Add new panel"
3. In the query box, enter: `rate(http_requests_total[5m])`
4. Panel title: "Request Rate"
5. Click "Apply"

### Step 4: Add More Panels

**Panel 2: Active Users**
- Query: `websocket_connections_active`
- Title: "Users Online Now"
- Visualization: Stat (single number)

**Panel 3: Response Time**
- Query: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
- Title: "95th Percentile Response Time"
- Unit: seconds

**Panel 4: Error Rate**
- Query: `rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100`
- Title: "Error Rate %"
- Thresholds: Green < 1%, Yellow 1-5%, Red > 5%

### Step 5: Save Your Dashboard
1. Click "Save dashboard" (disk icon)
2. Name: "Chat App Overview"
3. Click "Save"

---

## 🚨 Setting Up Alerts

### Why Alerts Matter

**Without alerts:**
- Problems happen at 3 AM
- You find out when users complain
- Damage is already done

**With alerts:**
- Get notified immediately
- Fix problems before users notice
- Sleep better at night 😴

### Alert Rules We've Created

**1. High Error Rate**
```yaml
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
  for: 2m
```
**Translation**: If more than 10% of requests fail for 2 minutes, alert me.

**2. Slow Response Time**
```yaml
- alert: HighResponseTime
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
  for: 5m
```
**Translation**: If 95% of requests take longer than 2 seconds for 5 minutes, alert me.

**3. Service Down**
```yaml
- alert: ServiceDown
  expr: up == 0
  for: 1m
```
**Translation**: If any service stops responding for 1 minute, alert me.

**4. High Memory Usage**
```yaml
- alert: HighMemoryUsage
  expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.8
  for: 5m
```
**Translation**: If memory usage is above 80% for 5 minutes, alert me.

---

## 🧪 Testing Your Monitoring

### Generate Fake Traffic

**Install load testing tool:**
```bash
brew install hey  # macOS
# or
sudo apt install hey  # Ubuntu
```

**Test 1: Normal Load**
```bash
# Generate 100 requests over 10 seconds
hey -n 100 -c 5 http://localhost:5001/api/auth/me
```

**Test 2: Heavy Load**
```bash
# Generate 1000 requests with 20 concurrent users
hey -n 1000 -c 20 http://localhost:5001/api/auth/me
```

**Test 3: Error Generation**
```bash
# Hit a non-existent endpoint to generate 404 errors
hey -n 100 -c 5 http://localhost:5001/api/nonexistent
```

### What to Watch in Grafana

After running tests, check your dashboard:

1. **Request Rate**: Should spike during tests
2. **Response Time**: Might increase under heavy load
3. **Error Rate**: Should increase when hitting bad endpoints
4. **Active Connections**: Should show WebSocket connections

---

## 🔍 Troubleshooting Guide

### Problem: "No data in Grafana"

**Possible causes:**
1. Prometheus not scraping your app
2. Your app not exposing metrics
3. Wrong Prometheus URL in Grafana

**Solutions:**
```bash
# Check if your app exposes metrics
curl http://localhost:5001/metrics
# Should return metrics data, not 404

# Check if Prometheus can reach your app
curl http://localhost:9090/api/v1/targets
# Should show your app as "UP"

# Check Grafana data source
# Go to Configuration → Data Sources → Prometheus → Test
# Should show green "Data source is working"
```

### Problem: "Prometheus container won't start"

**Error message**: `failed to create shim task`

**Solution:**
```bash
# Stop all containers
docker compose -f monitoring/docker-compose.monitoring.yml down

# Remove volumes (this deletes stored data)
docker volume prune

# Start again
docker compose -f monitoring/docker-compose.monitoring.yml up -d
```

### Problem: "Can't access Grafana"

**Check if container is running:**
```bash
docker ps
# Should show grafana container with status "Up"

# If not running, check logs:
docker logs grafana
```

### Problem: "Metrics not updating"

**Check Prometheus targets:**
1. Go to http://localhost:9090
2. Click "Status" → "Targets"
3. All targets should show "UP"
4. If "DOWN", check if services are running

---

## 📈 Understanding Prometheus Query Language (PromQL)

### Basic Concepts

**Metric Types:**

1. **Counter**: Only goes up (like odometer)
   - Example: `http_requests_total`
   - Use for: Total requests, errors, messages sent

2. **Gauge**: Can go up or down (like speedometer)
   - Example: `websocket_connections_active`
   - Use for: Current users, memory usage, temperature

3. **Histogram**: Measures distribution (like test scores)
   - Example: `http_request_duration_seconds`
   - Use for: Response times, request sizes

### Essential PromQL Functions

**`rate()`**: Calculate per-second rate
```promql
rate(http_requests_total[5m])
# How many requests per second in last 5 minutes
```

**`sum()`**: Add up values
```promql
sum(rate(http_requests_total[5m]))
# Total requests per second across all servers
```

**`avg()`**: Calculate average
```promql
avg(http_request_duration_seconds)
# Average response time
```

**`histogram_quantile()`**: Find percentiles
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
# 95% of requests complete within X seconds
```

### Time Ranges

- `[5m]`: Last 5 minutes
- `[1h]`: Last 1 hour
- `[1d]`: Last 1 day
- `[1w]`: Last 1 week

### Labels and Filtering

**Filter by HTTP method:**
```promql
http_requests_total{method="POST"}
```

**Filter by status code:**
```promql
http_requests_total{status=~"2.."}  # All 2xx status codes
http_requests_total{status=~"5.."}  # All 5xx status codes
```

**Multiple filters:**
```promql
http_requests_total{method="POST",status="200"}
```

---

## 🎯 Key Performance Indicators (KPIs) to Track

### The Golden Signals (Google SRE)

**1. Latency**: How fast is your app?
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```
**Target**: < 500ms for 95% of requests

**2. Traffic**: How much load is your app handling?
```promql
sum(rate(http_requests_total[5m]))
```
**Monitor**: Trends and spikes

**3. Errors**: How many requests are failing?
```promql
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100
```
**Target**: < 1% error rate

**4. Saturation**: How full are your resources?
```promql
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```
**Target**: < 80% CPU usage

### Chat App Specific KPIs

**User Engagement:**
```promql
# Messages per minute
rate(messages_sent_total[1m]) * 60

# Average users online
avg_over_time(websocket_connections_active[1h])

# Peak concurrent users
max_over_time(websocket_connections_active[1d])
```

**Business Metrics:**
```promql
# Daily active users (if you track login events)
increase(user_logins_total[1d])

# Message growth rate
rate(messages_sent_total[1w])
```

---

## 🚀 Next Steps (Day 2 Preview)

Tomorrow we'll add:

### 1. **Alertmanager** (Smart Notifications)
- Send alerts to Slack/email
- Group similar alerts
- Silence alerts during maintenance

### 2. **Custom Dashboards**
- Business-specific metrics
- User behavior analysis
- Performance optimization insights

### 3. **Log Aggregation** (ELK Stack)
- Centralized log collection
- Error tracking and debugging
- Log-based alerts

### 4. **Uptime Monitoring**
- External health checks
- Multi-region monitoring
- SLA tracking

---

## 💡 Pro Tips for Beginners

### 1. Start Simple
```javascript
// Good: Start with basic metrics
const totalRequests = new Counter({
  name: 'requests_total',
  help: 'Total requests'
});

// Avoid: Complex metrics with many labels initially
const complexMetric = new Histogram({
  name: 'complex_metric',
  labelNames: ['user', 'endpoint', 'browser', 'country', 'device']
  // This creates too many combinations!
});
```

### 2. Metric Naming Best Practices
```javascript
// Good: Descriptive with units
'http_request_duration_seconds'
'memory_usage_bytes'
'active_users_count'

// Bad: Vague or inconsistent
'time'
'stuff'
'data'
```

### 3. Dashboard Organization
- **Page 1**: Overview (most important metrics)
- **Page 2**: Deep dive (detailed breakdowns)
- **Page 3**: System health (infrastructure)

### 4. Alert Fatigue Prevention
- Start with critical alerts only
- Use appropriate thresholds (not too sensitive)
- Group related alerts
- Have clear escalation procedures

---

## 📚 Learning Resources

### Beginner-Friendly
- [Prometheus First Steps](https://prometheus.io/docs/introduction/first_steps/)
- [Grafana Getting Started](https://grafana.com/docs/grafana/latest/getting-started/)
- [PromQL Tutorial](https://prometheus.io/docs/prometheus/latest/querying/basics/)

### Advanced
- [Google SRE Book](https://sre.google/sre-book/table-of-contents/) (Free)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Grafana Dashboard Examples](https://grafana.com/grafana/dashboards/)

### Community
- [Prometheus Community](https://prometheus.io/community/)
- [r/PrometheusMonitoring](https://reddit.com/r/PrometheusMonitoring)
- [CNCF Slack #prometheus](https://slack.cncf.io/)

---

## 🎉 Congratulations!

You've successfully set up production-ready monitoring! 

**What you've accomplished:**
- ✅ Metrics collection from your chat app
- ✅ System monitoring (CPU, memory, disk)
- ✅ Real-time dashboards
- ✅ Automated alerting
- ✅ Performance tracking
- ✅ Error monitoring

**You can now:**
- See problems before users complain
- Track your app's performance over time
- Make data-driven decisions
- Scale confidently
- Sleep better at night 😴

**Next**: Tomorrow we'll make it even better with advanced alerting and log analysis!

---

## 🆘 Need Help?

**Common Issues:**
1. Docker not starting → Restart Docker Desktop
2. Ports already in use → Change ports in docker-compose.yml
3. No metrics data → Check if your app is running
4. Grafana login issues → Use admin/admin

**Get Support:**
- Check the troubleshooting section above
- Look at Docker logs: `docker logs <container-name>`
- Ask in the project's GitHub issues
- Join the community Slack channels

**Remember**: Everyone starts somewhere. Don't be afraid to experiment and break things - that's how you learn! 🚀