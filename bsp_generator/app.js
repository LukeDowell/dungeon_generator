/**
 * Created by lukedowell on 8/18/15.
 */
//Height and width of our tiles
var TILE_SIZE = 16;

//Min and max values for our leaves
//Our BSP generation will use this to determine when to stop making leaves
var MIN_LEAF_SIZE = 13;
var MAX_LEAF_SIZE = 25;

//The minimum width/height we want our rooms to have
var MIN_ROOM_SIZE = 7;

//Map size values
var MAP_WIDTH = 50;
var MAP_HEIGHT = 50;

//Our canvas and context, used for drawing to the DOM
var canvas = null;
var context = null;

/**
 * This application will demonstrate how to procedurally generate a
 * dungeon-like system using a BSP tree implementation. Compared to our
 * random room placement system, BSP generation tries to make dungeons look
 * more attractive. By separating our dungeon into sections, or 'leaves',
 * we can write some nice logic that will connect rooms in a more intuitive
 * manner.
 */
$(document).ready(function () {
    //Pull out the canvas and canvas 2d context
    canvas = document.getElementById("canvas");
    canvas.setAttribute("width", (MAP_WIDTH * TILE_SIZE).toString());
    canvas.setAttribute("height", (MAP_HEIGHT * TILE_SIZE).toString());

    context = canvas.getContext("2d");
    context.fillStyle = "black";
    //context.fillRect(0, 0, (MAP_WIDTH * TILE_SIZE), (MAP_HEIGHT * TILE_SIZE));
    //context.fillStyle = "white";

    //Create our leaf container and the 'root' leaf
    var leaves = [];
    var root = new Leaf(0, 0, MAP_WIDTH, MAP_HEIGHT);
    leaves.push(root);

    //While our leaves are able to split, do so
    var canSplit = true;
    while (canSplit) {
        canSplit = false;
        //Loop through all our leaves
        leaves.map(function (leaf) {
            //If the leaf has children
            if (leaf.children.left == null && leaf.children.right == null) {
                //If the leaf is bigger than that maximum allowed size, OR if a 25% chance is hit
                if (leaf.width > MAX_LEAF_SIZE || leaf.height > MAX_LEAF_SIZE || getRandom(1, 4) === 4) {
                    //Split the leaf!
                    if (leaf.split()) {
                        //Store the children
                        leaves.push(leaf.children.left);
                        leaves.push(leaf.children.right);
                        canSplit = true;
                    }
                    //Else no leaves qualify for splitting, canSplit will still be false
                }
            }
        });
    }
    root.createRooms();

    //DEBUG - DRAW OUR LEAVES
    console.log("Total leaves: " + leaves.length);
    context.lineWidth = 2;
    leaves.map(function (leaf) {

        //Draw leaf outline
        //context.strokeRect(leaf.x * TILE_SIZE,
        //    leaf.y * TILE_SIZE,
        //    leaf.width * TILE_SIZE,
        //    leaf.height * TILE_SIZE);

        if(leaf.room != null) {
            context.fillRect(
                leaf.room.x1 * TILE_SIZE,
                leaf.room.y1 * TILE_SIZE,
                leaf.room.width * TILE_SIZE,
                leaf.room.height * TILE_SIZE
            );

            leaf.room.corridors.map(function(hall) {
                context.fillRect(
                    hall.x1 * TILE_SIZE,
                    hall.y1 * TILE_SIZE,
                    hall.width * TILE_SIZE,
                    hall.height * TILE_SIZE
                )
            });
        }
    });


});

/**
 * Represents a leaf of our BSP tree. Leaves can have child leaves, sibling leaves and a room.
 *
 * @param x
 * @param y
 * @param width
 * @param height
 * @constructor
 */
function Leaf(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    //Store this leaf's children
    this.children = {
        left: null,
        right: null
    };

    //This leaf's room object
    this.room = null;

    //Stores our corridors connecting to other leaves
    this.corridors = [];
}

/**
 * Recursively searches through all of our leaves and adds rooms to their children.
 * Then, they are connected.
 */
Leaf.prototype.createRooms = function() {
    if(this.children.left != null || this.children.right != null) {
        //This leaf has children
        if(this.children.left != null) {
            this.children.left.createRooms();
        }

        if(this.children.right != null) {
            this.children.right.createRooms();
        }

        if(this.children.right != null && this.children.left != null) {
            createHall(this.children.left.getRoom(), this.children.right.getRoom());
        }
    } else {
        //No children, we are ready to make a room

        //We need to make a room that is contained within this leave's area, but it
        //cannot be pushed up against the wall of the leaf. We will give it at least 2 tiles of space
        var roomWidth = getRandom(MIN_ROOM_SIZE, this.width - 2);
        var roomHeight = getRandom(MIN_ROOM_SIZE, this.height - 2);

        //Place the room inside the leaf, but make sure it isn't next to the wall
        var roomX = getRandom(1, this.width - roomWidth - 1) + this.x;
        var roomY = getRandom(1, this.height - roomHeight - 1) + this.y;

        this.room = new Room(
            roomX,
            roomY,
            roomWidth,
            roomHeight
        );
        console.log("Created room: " , this.room);
    }
};

/**
 * Splits our leaf into two children if possible
 * @return
 *      False if the split failed, true if successful
 */
Leaf.prototype.split = function () {

    //If we already have children, we can't make any more
    if (this.children.left || this.children.right) {
        return false;
    }

    //Now we are going to figure out which direction to split into
    var splitHorizontally = (getRandom(0, 1) <= 0);

    //If the width is more than 25% larger than height, split vertically
    //If the height is more than 25% larger than width, split horizontally
    if (this.width > this.height && (this.width / this.height) >= 1.25) {

        splitHorizontally = false;

    } else if (this.height > this.width && (this.height / this.width) >= 1.25) {

        splitHorizontally = true;

    }

    var maxChildSize = (splitHorizontally ? this.height : this.width) - MIN_LEAF_SIZE;
    //Check to see if we can't split anymore due to room size
    if (maxChildSize <= MIN_LEAF_SIZE) {
        return false;
    }

    //Determine our split and create our children
    var split = getRandom(MIN_LEAF_SIZE, maxChildSize);

    if (splitHorizontally) {
        this.children.left = new Leaf(this.x, this.y, this.width, split);
        this.children.right = new Leaf(this.x, this.y + split, this.width, this.height - split);
    } else {
        this.children.left = new Leaf(this.x, this.y, split, this.height);
        this.children.right = new Leaf(this.x + split, this.y, this.width - split, this.height);
    }
    return true;
};

/**
 * Recursively searches through a given leaf and finds a room. If the function
 * has to choose between two rooms, it will randomly select one.
 * @returns {*}
 *      A room object, null if there are no children to be had
 */
Leaf.prototype.getRoom = function() {
    if(this.room != null) {
        //If we have a room, return it
        return this.room;
    } else {
        //Declare some children
        var leftRoom = null;
        var rightRoom = null;

        //Assign this leaf's children to the above variables if they exist
        if(this.children.left != null) {
            leftRoom = this.children.left.getRoom();
        }
        if(this.children.right != null) {
            rightRoom = this.children.right.getRoom();
        }

        //dat return
        if(leftRoom === null && rightRoom === null) {
            return null;
        } else if(rightRoom === null) {
            return leftRoom;
        } else if(leftRoom === null) {
            return rightRoom;

            //If we have two rooms to choose from, select one at random
        } else if(getRandom(0, 1) === 0) {
            return leftRoom;
        } else {
            return rightRoom;
        }
    }
};

/**
 * Creates hallways between two rooms.
 *
 * This code blows, no me gusta
 *
 * @param leftRoom
 *      The first room
 * @param rightRoom
 *      The second room
 */
function createHall(leftRoom, rightRoom) {

    var halls = [];
    var pointOne = {
        x: getRandom(leftRoom.x1 + 1, leftRoom.x2 - 2),
        y: getRandom(leftRoom.y1 + 1, leftRoom.y2 - 2)
    };

    var pointTwo = {
        x: getRandom(rightRoom.x1 + 1, rightRoom.x2 - 2),
        y: getRandom(rightRoom.y1 + 1, rightRoom.y2 - 2)
    };

    var width = pointTwo.x - pointOne.x;
    var height = pointTwo.y - pointOne.y;

    if(width < 0) {
        if(height < 0) {
            if(getRandom(0, 1) === 0) {
                halls.push(new Corridor(pointTwo.x, pointOne.y, Math.abs(width), 1));
                halls.push(new Corridor(pointTwo.x, pointTwo.y, 1, Math.abs(height)));
            } else {
                halls.push(new Corridor(pointTwo.x, pointTwo.y, Math.abs(width), 1));
                halls.push(new Corridor(pointOne.x, pointTwo.y, 1, Math.abs(height)));
            }
        } else if(height > 0) {
            if(getRandom(0, 1) === 0) {

                halls.push(new Corridor(pointTwo.x, pointOne.y, Math.abs(width), 1));
                halls.push(new Corridor(pointTwo.x, pointOne.y, 1, Math.abs(height)));

            } else {

                halls.push(new Corridor(pointTwo.x, pointTwo.y, Math.abs(width), 1));
                halls.push(new Corridor(pointOne.x, pointOne.y, 1, Math.abs(height)));

            }
        } else {
            //Height is 0
            halls.push(new Corridor(pointTwo.x, pointTwo.y, Math.abs(width), 1));
        }
    }
    else if (width > 0) {
        if (height < 0)
        {
            if (getRandom(0, 1) === 0)
            {
                halls.push(new Corridor(pointOne.x, pointTwo.y, Math.abs(width), 1));
                halls.push(new Corridor(pointOne.x, pointTwo.y, 1, Math.abs(height)));
            }
            else
            {
                halls.push(new Corridor(pointOne.x, pointOne.y, Math.abs(width), 1));
                halls.push(new Corridor(pointTwo.x, pointTwo.y, 1, Math.abs(height)));
            }
        }
        else if (height > 0)
        {
            if (getRandom(0, 1) === 0)
            {
                halls.push(new Corridor(pointOne.x, pointOne.y, Math.abs(width), 1));
                halls.push(new Corridor(pointTwo.x, pointOne.y, 1, Math.abs(height)));
            }
            else
            {
                halls.push(new Corridor(pointOne.x, pointTwo.y, Math.abs(width), 1));
                halls.push(new Corridor(pointOne.x, pointOne.y, 1, Math.abs(height)));
            }
        }
        else
        {
            halls.push(new Corridor(pointOne.x, pointOne.y, Math.abs(width), 1));
        }
    } else {
        if(height < 0) {
            halls.push(new Corridor(pointTwo.x, pointTwo.y, 1, Math.abs(height)));
        } else {
            halls.push(new Corridor(pointOne.x, pointOne.y, 1, Math.abs(height)))
        }
    }

    //Assign our rooms to our children. Each child will have a reference, not sure
    //if that is bad
    console.log(halls.length);
    leftRoom.corridors = halls;
    rightRoom.corridors = halls;
}

/**
 * Represents a single room in our dungeon. Just a rectangle, really.
 * @param x
 *      The starting x GRID location of our room
 * @param y
 *      The starting y GRID location of our room
 * @param width
 * @param height
 * @constructor
 */
function Room(x, y, width, height) {
    //Width and height of room in grid units
    this.width = width;
    this.height = height;

    //x1, x2, y1 and y2 refer to the corners of our room.
    //North west corner
    this.x1 = x;
    this.y1 = y;

    //South east corner
    this.x2 = x + this.width;
    this.y2 = y + this.height;

    //A point that contains our center point of the room
    this.centerPoint = {
        x: Math.floor((this.x1 + this.x2) / 2),
        y: Math.floor((this.y1 + this.y2) / 2)
    };


}

/**
 * Helper function that will tell us whether or not the provided room
 * intersects with this room
 * @param room
 *      The room we are checking against
 * @returns {boolean}
 *      True if intersects, false if not
 */
Room.prototype.intersects = function (room) {
    return (
        this.x1 <= room.x2 &&
        this.x2 >= room.x1 &&
        this.y1 <= room.y2 &&
        room.y2 >= room.y1
    );
};

/**
 * Represents a corridor. Also just a Rectangle.
 * @param x1
 *      The north west corner's x value
 * @param y1
 *      The north west corner's y value
 * @param width
 *      Width of the corridor
 * @param height
 *      Height of the corridor
 * @constructor
 */
function Corridor(x1, y1, width, height) {
    this.x1 = x1;
    this.y1 = y1;
    this.width = width;
    this.height = height;
}

/**
 * Returns a random inclusive number between the given values
 * @param min
 *      The minimum value
 * @param max
 *      The maximum value
 * @returns {number}
 *      Random number
 */
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}