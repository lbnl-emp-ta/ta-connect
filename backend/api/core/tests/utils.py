def check_if_given_exception_raised(exception, func, **kwargs):
    """
    Returns True is the given exception was raised by the given function.
    Returns False otherwise.
    """
    raised_given_exception = False
    
    try:
        func(**kwargs)
    except exception:
        raised_given_exception = True
        
    return raised_given_exception