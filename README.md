# Random stuff

## High Level Activities
```
Home  
  Today (BTDY)
  Top Stories (TOP)
  News Read Story  (NSN) 
  My News (MYN)  Equities (WEI)
  Economic Events (ECO)  Worksheets   
  [+ any other widgets on home which has a "More >" action]
Search
IB
  Start/Find Chat
  Read Chat  Start/Find/Read (iPad mode uses split view so user sees both things together)
  New Chat
  New Blast
  Settings
  What's new tour
  View Chat Details
  Participants
  Forward Post
  Reply to Post
Alerts
People
Front Page
Securities
Research
TV
Radio
TW
FILE
NOTE
```

## Visualisations

For basic graphs we could use https://developers.google.com/chart/interactive/docs/gallery but it can be fiddly to get exactly what you want. if the examples are good enough and you just want a different dataset it is easy though.

Google Analytics
https://www.orbitmedia.com/blog/user-flow-google-analytics/
https://digitalcommunications.wp.st-andrews.ac.uk/2016/11/15/using-the-users-flow-report-in-google-analytics/
https://yoast.com/users-flow-in-google-analytics/

This seems a clone of GA
https://mixpanel.com/blog/user-flow-analysis/

Good example showing how loops are represented in GA User Flow analytics
https://digitalcommunications.wp.st-andrews.ac.uk/files/2016/10/users-flow-step1.png

Note how "/" and "/index.html" appears in multiple columns

Note also the (>100 more pages) bucketsI think the way this works is user picks a start page (in our case Activity), or a session attribute (e.g. country), and then we group every session based on first activity, second, third, etc. such that we have a tree (non a graph - there is no recombining paths) where activities are represented as nodes (and can appear repeated at multiple levels) and the tree depth corresponds to first activity, second, third, etc.

Chart style is called Sankey
https://d3-graph-gallery.com/sankey.htm
https://developers.google.com/chart/interactive/docs/gallery/sankeyl




## Notes for drawing Sankey diagram

based on https://digitalcommunications.wp.st-andrews.ac.uk/files/2016/10/users-flow-step1.png

See also https://mixpanel.com/blog/user-flow-analysis/ (Starting=Open Message, Ending=Any Event, Users In 2 Cohorts, Time Last 30 days)

https://www.w3schools.com/graphics/svg_grad_linear.asp
https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Gradients
https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
```
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
```