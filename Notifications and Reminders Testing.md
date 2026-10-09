 Run this in terminal:
 
 curl -i http://localhost:3000/api/push/dispatch \ -H "Authorization: Bearer 155ba4305976567ceac40c7e3aa6b979fdea0793b330173f9c3d38f0d502ad23"


1. Test Scheduled Reminders
    - simply set a schedule reminder in the settings
    - run the curl for test
2. Test budget alerts
    - modify budgets and expenses data in supabase
    - Test A: 80% usage
    - Test B: 100% usage
    - run the curl in the terminal for test

Before proceeding to the next test, clear first the push_notification_events   event_key in supabase

3. Test savings goal reminders
    - make sure there is a savings goals recorded
    - just run the curl in the terminal for test

Again, before proceeding to the next test, clear first the push_notification_events   event_key in supabase

4. Test weekly summaries
    - in the dispatch route, find if (weekday === 'Sun' && time >= '20:00')
    - temporarily replace it with if (true)
    - run the curl for test

THE END OF STORY

