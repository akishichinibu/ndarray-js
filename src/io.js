import { ndArray } from "./ndarray"

ndArray.prototype.show = function() {
    console.log(this.shapeObj);
    console.log(this.buffer);
}
