# Overview

An obsidian notes plugin that functions as an easy to use TODO list using the GTD system

## Loose idea

In any note, a user should be able to create a todo, preferably with a definable hotkey, that automatically formats it as such:

```
[ ] Thing to do #todo/maybe #todo/creation-date-time #todo/due-date #todo/completed-date-time
[ ] Thing to do #todo/inbox #todo/due-date
```

And so forth.

I'm open to suggestions or ideas around whether to use tags or some other system.

The todos should be visible in a sidebar or another view that collects all of them into 4 individual tabs based on the GTD system and indicated with useful symbols.

The key here is that ANYWHERE in the vault where these tags are found, the corresponding todo item should be added to this visible list. If the checkbox item does not have a tag, then it should be ignored. this is where some other plugins fall short.

This plugin is largely based on https://github.com/larslockefeer/obsidian-plugin-todo but unfortunatley that plugin pulls in any checkbox item. It might be wroth just forking it and removing the bits I don't like since it does most of the work. I'm open to suggestions on this.


```
