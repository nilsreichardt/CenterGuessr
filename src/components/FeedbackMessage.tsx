interface FeedbackMessageProps {
  isCorrect: boolean | null;
  correctClass: string | null;
}

const FeedbackMessage = ({ isCorrect, correctClass }: FeedbackMessageProps) => {
  if (isCorrect === null) return null;

  return (
    <div
      className={`p-4 rounded-md text-center text-white font-medium my-4 ${isCorrect ? "bg-green-500" : "bg-red-500"}`}
    >
      {isCorrect ? (
        <p>Great job! That's correct!</p>
      ) : (
        <p>
          Not quite. This alumnus was in{" "}
          <span className="font-bold">{correctClass}</span>.
        </p>
      )}
    </div>
  );
};

export default FeedbackMessage;
