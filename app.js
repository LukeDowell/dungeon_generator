/**
 * Created by lukedowell on 8/18/15.
 */
//32 pixels for height and width
var TILE_SIZE = 16;

//Min and max values for our room in grid units
var MIN_ROOM_SIZE = 5;
var MAX_ROOM_SIZE = 12;

//Map size values
var MAP_WIDTH = 50;
var MAP_HEIGHT = 50;

//Our canvas and context
var canvas = null;
var context = null;

/**
 * This application will demonstrate how to procedurally generate a
 * dungeon-like system. In this application, we will occasionally convert
 * from grid units to pixel units. Grid units will refer to a specific tile,
 * whereas pixel units will be equal to a grid unit multiplied by the
 * size of our tiles. Most of our calculations will be done in grid units
 * so as to keep our numbers as small and manageable as possible.
 */
$(document).ready(function() {
    //Pull out the canvas and canvas 2d context
    canvas = document.getElementById("canvas");
    canvas.setAttribute("width", (MAP_WIDTH * TILE_SIZE));
    canvas.setAttribute("height", (MAP_HEIGHT * TILE_SIZE));

    context = canvas.getContext("2d");
    context.fillStyle = "black";
    context.fillRect(0, 0, (MAP_WIDTH * TILE_SIZE), (MAP_HEIGHT * TILE_SIZE));
    context.fillStyle = "grey";

    console.log(context);

    var rooms = placeRooms(5);
});

/**
 * Draws a room onto our canvas
 * @param room
 *      The room to draw
 * @param ctx
 *      The context with which we will draw our room
 */
function drawRoom(room, ctx) {
    console.log(room);
    ctx.fillRect(room.x1 * TILE_SIZE,
                    room.y1 * TILE_SIZE,
                    room.width * TILE_SIZE,
                    room.height * TILE_SIZE);
}

/**
 * Places a given amount of rooms randomly. Will keep trying until the correct number of
 * rooms are generated. Beware.
 * @param numRooms
 *      The number of rooms we'll try to make
 */
function placeRooms(numRooms) {

    //A container for all the rooms we have generated thus far
    var rooms = [];

    //Until we have generated the requested number of rooms, keep trying.
    while(rooms.length < numRooms) {

        //Random width and height
        var width = getRandom(MIN_ROOM_SIZE, MAX_ROOM_SIZE);
        var height = getRandom(MIN_ROOM_SIZE, MAX_ROOM_SIZE);

        //Random x and y value
        var x = getRandom(0, MAP_WIDTH - width - 1) + 1;
        var y = getRandom(0, MAP_HEIGHT - height - 1) + 1;

        var newRoom = new Room(x, y, width, height);

        //Loops through all the previous rooms to see if it intersects with any of them
        var doesIntersect = false;
        for(var i = 0; i < rooms.length; i++) {
            if(newRoom.intersects(rooms[i])) {
                doesIntersect = true;
            }
        }

        if(!doesIntersect) {
            drawRoom(newRoom, context);
            if(rooms.length > 0) {
                var prevRoom = rooms[rooms.length-1];
                genHorizontalCorridor(newRoom, prevRoom);
                genVerticalCorridor(newRoom, prevRoom);
            }
            rooms.push(newRoom);
            console.log("Room created: " , newRoom);
        } else {
            console.log("Room failed, trying again");
        }
    }

    return rooms;
}

/**
 * Generates a horizontal corridor between two rooms.
 * @param newRoom
 *      The first room
 * @param prevRoom
 *      The second room
 */
function genHorizontalCorridor(newRoom, prevRoom) {
    var corridorLength = (newRoom.centerPoint.x - prevRoom.centerPoint.x);
    var corridorX = null;
    var corridorY = prevRoom.centerPoint.y;
    var corridorHeight = 1;

    if(corridorLength > 0) {
        //Runs east, so we use the previous room as a starting point
        corridorX = prevRoom.centerPoint.x;
    } else {
        //Runs west, so we use the current room as a starting point
        corridorX = newRoom.centerPoint.x;
    }
    var corridor = new Corridor(
        corridorX,
        corridorY,
        Math.abs(corridorLength),
        corridorHeight);
    return corridor;
}

/**
 * Generates a horizontal corridor between two rooms.
 * @param newRoom
 *      The first room
 * @param prevRoom
 *      The second room
 */
function genVerticalCorridor(newRoom, prevRoom) {
    var corridorHeight = (newRoom.centerPoint.y - prevRoom.centerPoint.y);
    var corridorX = newRoom.centerPoint.x;
    var corridorY = null
    var corridorWidth = 1;
    if(corridorHeight > 0) {
        //Runs north, so we should start from the lowest room
        corridorY = prevRoom.centerPoint.y;
    } else {
        //Runs south
        corridorY = newRoom.centerPoint.y;
    }
    var corridor = new Corridor(
        corridorX,
        corridorY,
        corridorWidth,
        Math.abs(corridorHeight) + 1);
    return corridor;
}

/**
 * Represents a single room in our dungeon
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

    /**
     * Helper function that will tell us whether or not the provided room
     * intersects with this room
     * @param room
     *      The room we are checking against
     * @returns {boolean}
     *      True if intersects, false if not
     */
    this.intersects = function(room) {
        return (
        this.x1 <= room.x2 &&
        this.x2 >= room.x1 &&
        this.y1 <= room.y2 &&
        room.y2 >= room.y1
        );
    }
}

/**
 * Represents a corridor
 * @param x1
 *      The north west corner's x value
 * @param y1
 *      The north west corner's y value
 * @param x2
 *      The south east corner's x value
 * @param y2
 *      The south east corner's y value
 * @constructor
 */
function Corridor(x1, y1, width, height) {
    this.x1 = x1;
    this.y1 = y1;
    this.width = width;
    this.height = height;
    context.fillRect(
        x1 * TILE_SIZE,
        y1 * TILE_SIZE,
        width * TILE_SIZE,
        height * TILE_SIZE);
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