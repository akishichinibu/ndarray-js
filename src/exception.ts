
function _buildException(type: string, msg: string): string {
    return `<ndarray> [${type}] ${msg}`;
}


function buildIndexError(msg: string): string {
    return _buildException("IndexError", msg);
}


function buildRunningTimeError(msg: string): string {
    return _buildException("RunningTimeError", msg);
}


export {
    buildIndexError,
    buildRunningTimeError,
}
