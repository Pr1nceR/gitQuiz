import { Fragment } from "react";

const FENCE = /```(?:[a-z]*)\n([\s\S]*?)```/g;
const INLINE = /(`[^`\n]+`|\*\*[^*\n]+\*\*)/g;

function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(INLINE).map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={i}>{part.slice(1, -1)}</code>;
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

/** Renders the small markdown subset used in question text as real elements. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(FENCE).map((chunk, i) =>
        i % 2 === 1 ? (
          <pre key={i}>
            <code>{chunk.replace(/\n$/, "")}</code>
          </pre>
        ) : (
          <Inline key={i} text={chunk} />
        ),
      )}
    </>
  );
}
