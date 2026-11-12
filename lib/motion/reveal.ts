/** Adds .is-in to .reveal elements as they enter the viewport. CSS does the motion. */
export function reveal(root: ParentNode = document): () => void {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  root.querySelectorAll('.reveal:not(.is-in)').forEach((el) => io.observe(el));
  return () => io.disconnect();
}
