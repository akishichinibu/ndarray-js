
function _buildException(type, msg) {
    return type + ": " + msg;
}


function buildIndexError(msg) {
    return _buildException("IndexError", msg);
}


function buildRunningTimeError(msg) {
    return _buildException("RunningTimeError", msg);
}

export {
    buildIndexError,
    buildRunningTimeError,
}
