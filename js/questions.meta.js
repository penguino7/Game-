const QUESTION_META = Array.from({ length: 30 }, (_, i) => {
  const id = i + 1;
  return { id, status: "READY" }; // READY / LOCKED / DONE
});
