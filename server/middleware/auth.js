import jwt from "jsonwebtoken";

const auth = async(request, response, next) =>{
try {
    const token = request.cookies.accessToken || request?.header?.authorization?.split(" ")[1]; /// ["bearer", "token"]
    
    if (!token) {
        return response.status(401).json({
            message : "Provide token"
        });
    }

    const decode = await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN )
    if(!decode){
        return response.status(401).json({
            message : "Unauthorize access",
            error : true,
            success : false
        });
    }

    request.userId = decode.id;

    next()

    console.log('decode', decode)
    } catch (error) {
        return response.status(401).json({
            message : "Invalid or expired token",
            error : true,
            success : false
        });
    }
}

export default auth;