# Gnosis Frontend Log

# Sprint 2 Additions - 10/30
- Added a protected route to only expose upload and feed functionality after a user has successfully logged in
    - "root" username and password exception has been added as a function to test the route protection. This is to be removed after testing is completed and valide user accounts are provisioned 
- Minor updates to user login and signup UI 
- Minor updates to navigtion bar UI 
- Added the functionality to reply to conversations. FeedPage.js has been updated to work with the latest version of gnosis-convo.
    - Current local tests are showing that there are no conversations to pull - the commented out part of FeedPage.js can be used to show the functionality of the reply mechanism when there are no conversations to pull. 

# Sprint 1 - 10/1
- Initial development of frontend. Functionality to hide uploads page until after a user has authenticated will be added after testing
