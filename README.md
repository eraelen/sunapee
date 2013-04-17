# CMPSCI 326 Web Programming: Project 4
# Team Sunapee

## How to Run
You can run our app using `node app.js`
 
## Project Assignment 04

Here is a list of the files and the main additions we made:
### Task 1 - AJAX Implementation
Composing new tweets from Home page now is implemented using AJAX. 
The page does not refresh when new tweet is posted. Both the list of tweets and tweet counter in Home page updates without the page refreshing.
Visiting other pages (such as Profile and clicking Detail and Reply of new tweet) will show that the new tweet is saved.

### Task 2 - Websocket Implementation
A basic implementation of websockets is presented in the global chat app.
A link to this is provided from the top left corner of each page available in the site. 

Some additional notes:
Another implementation of AJAX in our project is deleting followers and unfollowing users that logged in user is currently following ONLY from Following page.
In our project, we want users to be able to delete users that they don't want following them. At the moment, this can only be done by going to their own Followers page and deleting the users there.
We have also been working on migrating unfollow/follow functionalities using AJAX. Right now, only the unfollow feature works. 

For testing what is already functional:
* You may use login username: {tim, hazel, caleb}, password: {mit, lezah, belac}
* In registering for a new user, please use a valid and active email. The system does send email!
