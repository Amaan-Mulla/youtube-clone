function ErrorState({ message = "Something went wrong." }) {
  return <p role="alert">{message}</p>;
}

export default ErrorState;
