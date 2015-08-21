#Information

This repository will demonstrate different ways to create dungeon systems. This is a learning experience for me,
so I do not guarantee that these methods are the best or most efficient ways to go about creating dungeons.
Any comments or tips are welcome.

#Generators

A listing of the types of generators I have implemented:

##Random Generation

Random generation takes in a minimum and maximum room size and randomly throws a given amount onto the screen. It
only checks against collisions with other rooms. Each time a room is placed, it checks to see if there are other rooms.
If there are, a corridor is created between the newly placed room and the previously placed room. This method is fairly
undesirable as dungeons tend to not make a lot of sense.

##BSP Generation

http://www.roguebasin.com/index.php?title=Basic_BSP_Dungeon_generation

My BSP generation tries to follow the above wiki page. Dungeons are split into semi-random 'leaves'. The leaves
can have child leaves or a room. The logic in this method is highly tune-able, playing with a lot of the inputs
can drastically change the style of the created dungeon.