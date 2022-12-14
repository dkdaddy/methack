drawing logic
based on https://digitalcommunications.wp.st-andrews.ac.uk/files/2016/10/users-flow-step1.png
See also https://mixpanel.com/blog/user-flow-analysis/ (Starting=Open Message, Ending=Any Event, Users In 2 Cohorts, Time Last 30 days)

for each stage "1st interaction,..."
 X sessions, y drop-offs
 for each activity, ranked by count
 add catch all bucket (other, 272,332)

height of box proportional to count (compute scaling factor based on total sessions / imageHeight)
 make whitespace constant between each
 if text fits in box draw there, else in whitespace
out flows, multiple, one per connection, with proportional 
red gradient drop off, width proportional to drop off rate



 Interactivity
 Filters on sessions - time, device type, device, UUID, cohort, 

 Aggregate data format 
   array of activity, count, child activities

uuid, start time, end time, device, other stuff
fake data generator 
    per session
    pick random activity, pick second random, third, 
    skew with activity popularity and transition popularities 
    IB 50% of time, MSG 20%, => foreach activity, Math.random()>activity.x => pick it
    IB->MSG 10% 
    nothing picked, drop-out