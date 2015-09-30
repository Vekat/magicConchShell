/**
 *  @file helpers.js
 *  @author vitor cortez
 */

var helpers = exports;

helpers.randomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;
