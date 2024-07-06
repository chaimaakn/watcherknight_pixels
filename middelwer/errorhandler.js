function errorHandler(err, req, res, next) {
    // Log the error
    console.error(err.stack);
  

    const statusCode = err.statusCode || 500;
  

    res.status(statusCode).json({
      status: 'error',
      statusCode: statusCode,
      message: err.message || 'Internal Server Error',
    });
  }
  


  

module.exports=errorHandler;