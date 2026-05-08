const isAdmin = (s) => {
    if ( s === 'ADMIN' || s === 'SUPERADMIN'){
        return true
    }
    return false
 }
 
 export default isAdmin