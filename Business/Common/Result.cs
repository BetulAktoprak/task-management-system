namespace Business.Common;

public class Result
{
    public bool IsSuccess { get; private set; }
    public bool IsFailure => !IsSuccess;
    public string ErrorMessage { get; private set; } = string.Empty;
    public List<string> Errors { get; private set; } = new();

    protected Result(bool isSuccess, string errorMessage)
    {
        IsSuccess = isSuccess;
        ErrorMessage = errorMessage;
        
        if (!string.IsNullOrEmpty(errorMessage))
        {
            Errors.Add(errorMessage);
        }
    }

    protected Result(bool isSuccess, List<string> errors)
    {
        IsSuccess = isSuccess;
        Errors = errors ?? new List<string>();
        ErrorMessage = errors?.FirstOrDefault() ?? string.Empty;
    }

    public static Result Success()
    {
        return new Result(true, string.Empty);
    }

    public static Result Failure(string errorMessage)
    {
        return new Result(false, errorMessage);
    }

    public static Result Failure(List<string> errors)
    {
        return new Result(false, errors);
    }
}

public class Result<T> : Result
{
    public T? Data { get; private set; }

    private Result(bool isSuccess, T? data, string errorMessage) 
        : base(isSuccess, errorMessage)
    {
        Data = data;
    }

    private Result(bool isSuccess, T? data, List<string> errors) 
        : base(isSuccess, errors)
    {
        Data = data;
    }

    public static Result<T> Success(T data)
    {
        return new Result<T>(true, data, string.Empty);
    }

    public static Result<T> Failure(string errorMessage)
    {
        return new Result<T>(false, default, errorMessage);
    }

    public static Result<T> Failure(List<string> errors)
    {
        return new Result<T>(false, default, errors);
    }
}
