//promise resove/reject is used to handle the errors in the async functions


const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err) => {
            next(err);
        });
    };
}





export { asyncHandler }



// const asyncHandler = () => {}
    // const asyncHandler = (func) => () => {}
        // here passing the func as a parameter and returning a function which is a higher order function
// const asyncHandler = (func) => async() => {}

// so it  as a wrapper function to handle the errors in the async functions 
// it is using try cantch above we will make using promise 
    // const asyncHandler = (func) => async(req,res,next) => {
    //     try {
    //         await func(req,res,next);
    //     } catch (error) {
    //         return res.status(error.code || 500).json({
    //             success: false,
    //             message: error.message,
    //         }); 
    //     }
    // } 