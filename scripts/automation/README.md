# Automation Scripts

This directory contains automation scripts for maintaining and operating the SponsorBase platform.

## Scripts Overview

### Database Maintenance
- `backup-database.py` - Automated database backups
- `cleanup-old-data.py` - Removes outdated records
- `update-search-index.py` - Keeps search index synchronized
- `data-quality-check.py` - Validates data integrity

### User Management
- `user-onboarding.py` - Automated welcome sequences
- `reputation-updater.py` - Updates user reputation scores
- `inactive-user-cleanup.py` - Manages inactive accounts
- `verification-reminders.py` - Sends verification reminders

### Content Moderation
- `auto-moderator.py` - Basic content filtering
- `spam-detector.py` - Identifies spam submissions
- `duplicate-content-detector.py` - Finds duplicate submissions
- `moderation-queue-processor.py` - Processes moderation queue

### Monitoring & Alerting
- `health-check.py` - System health monitoring
- `performance-monitor.py` - Tracks system performance
- `error-reporter.py` - Reports critical errors
- `usage-analytics.py` - Generates usage reports

### Email Automation
- `welcome-email.py` - Sends welcome emails to new users
- `weekly-digest.py` - Generates weekly content digests
- `sponsorship-alerts.py` - Notifies users of new opportunities
- `feedback-requests.py` - Requests user feedback

## Usage

### Setup
```bash
# Install required dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configurations
```

### Running Scripts
```bash
# Run database backup
python backup-database.py --full --compress

# Process moderation queue
python moderation-queue-processor.py --auto-approve-threshold 0.9

# Send weekly digest
python weekly-digest.py --segment all-users
```

## Scheduling

### Cron Jobs
```bash
# Database maintenance (daily at 2 AM)
0 2 * * * cd /path/to/sponsorbase && python scripts/automation/backup-database.py

# Search index update (every 4 hours)
0 */4 * * * cd /path/to/sponsorbase && python scripts/automation/update-search-index.py

# User onboarding (every hour)
0 * * * * cd /path/to/sponsorbase && python scripts/automation/user-onboarding.py

# Content moderation (every 30 minutes)
*/30 * * * * cd /path/to/sponsorbase && python scripts/automation/auto-moderator.py

# Weekly digest (Sundays at 9 AM)
0 9 * * 0 cd /path/to/sponsorbase && python scripts/automation/weekly-digest.py
```

### Systemd Services
```ini
# /etc/systemd/system/sponsorbase-automation.service
[Unit]
Description=SponsorBase Automation Service
After=network.target

[Service]
Type=simple
User=sponsorbase
WorkingDirectory=/path/to/sponsorbase
ExecStart=/usr/bin/python3 scripts/automation/main-automation-loop.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## Configuration

### Environment Variables
```bash
# Database configuration
DATABASE_URL=postgresql://user:pass@localhost/sponsorbase
REDIS_URL=redis://localhost:6379

# Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@sponsorbase.com
SMTP_PASS=your_app_password

# Monitoring configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SENTRY_DSN=https://your-sentry-dsn

# API keys
CLEARBIT_API_KEY=your_clearbit_key
HUNTER_API_KEY=your_hunter_key
```

### Script Configuration
```yaml
# config/automation.yaml
database:
  backup_retention_days: 30
  cleanup_threshold_days: 365
  
email:
  batch_size: 100
  rate_limit_per_minute: 60
  
moderation:
  auto_approve_threshold: 0.95
  spam_threshold: 0.8
  
monitoring:
  health_check_interval: 300
  error_threshold: 5
```

## Monitoring

### Health Checks
- Database connectivity
- API endpoint availability
- Search engine status
- Email service connectivity
- Disk space usage
- Memory usage

### Metrics Tracking
- Script execution times
- Success/failure rates
- Data quality metrics
- User engagement metrics
- System resource usage

### Alerting
- Critical system failures
- Data quality issues
- Security incidents
- Performance degradation
- Resource exhaustion

## Error Handling

### Logging
- Structured logging with JSON format
- Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
- Centralized log aggregation
- Log retention policies

### Retry Logic
- Database operations: 3 retries with exponential backoff
- API calls: Respect rate limits, implement backoff
- Email sending: Queue failed emails for retry
- File operations: Handle permission and space issues

### Failure Recovery
- Automatic service restart
- Graceful degradation
- Manual intervention alerts
- Rollback capabilities

## Security

### Access Control
- Script execution permissions
- Database access restrictions
- API key management
- File system permissions

### Data Protection
- Encrypt sensitive data at rest
- Use secure connections
- Implement audit logging
- Regular security updates

## Performance

### Optimization
- Database query optimization
- Batch processing for large datasets
- Caching frequently accessed data
- Parallel processing where appropriate

### Resource Management
- Memory usage monitoring
- CPU usage optimization
- Disk space management
- Network bandwidth optimization

## Testing

### Unit Tests
```bash
# Run all tests
python -m pytest tests/

# Run specific test file
python -m pytest tests/test_backup_database.py

# Run with coverage
python -m pytest --cov=scripts tests/
```

### Integration Tests
- Database connectivity
- API integration
- Email delivery
- File system operations

### Load Testing
- Database backup performance
- Bulk data processing
- Email sending throughput
- Concurrent script execution

## Troubleshooting

### Common Issues
- **Database connection failures**: Check credentials, network connectivity
- **Email sending failures**: Verify SMTP configuration, check rate limits
- **Performance issues**: Monitor resource usage, optimize queries
- **Permission errors**: Check file permissions, user accounts

### Debug Mode
```bash
# Run script with debug logging
python backup-database.py --debug --verbose

# Run with dry-run mode
python cleanup-old-data.py --dry-run --verbose
```

### Getting Help
- Check logs in `logs/` directory
- Review monitoring dashboards
- Check system health status
- Create detailed bug reports

## Contributing

When adding new automation scripts:

1. Follow existing code patterns and conventions
2. Add comprehensive error handling and logging
3. Include configuration options
4. Write unit tests
5. Update documentation
6. Add monitoring and alerting
7. Test in staging environment first

## Maintenance

### Regular Tasks
- Review and update scripts monthly
- Monitor performance metrics
- Update dependencies
- Review security configurations
- Test backup and recovery procedures

### Updates
- Test changes in development environment
- Use feature flags for gradual rollout
- Monitor for regressions
- Update documentation
- Train team on new features
