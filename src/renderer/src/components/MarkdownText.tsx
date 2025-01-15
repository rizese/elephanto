import Markdown from 'react-markdown';
import linkify from 'linkifyjs';

const LINEBREAK = '{{BREAK}}';

type Props = {
  linkClassName?: string;
  className?: string;
  text: string;
};

export default function MarkdownText({ className, text }: Props) {
  let markdownText = formatLinksToMarkdown(text);
  markdownText = formatNewlinesToMarkdown(markdownText);

  const sections = markdownText.split(LINEBREAK);

  return sections.map((section) => {
    if (!section) {
      return <br />;
    }

    return (
      <Markdown
        children={section}
        className={className}
        components={{
          a(props) {
            return (
              <a
                className={`text-blue-500 underline underline-offset-2`}
                target="__blank"
                {...props}
              />
            );
          },
          blockquote(props) {
            return (
              <blockquote
                className="m-1 border-l border-l-8 border-l-neutral-200 px-3 py-2"
                {...props}
              />
            );
          },
          code(props) {
            return props.node?.position?.start.line ==
              props.node?.position?.end.line ? (
              <code
                className="rounded-small bg-neutral-100 px-1 py-1"
                {...props}
              />
            ) : (
              <pre className="w-full overflow-x-auto">
                <code
                  className={cn(
                    'rounded-small bg-neutral-100 px-1 py-1',
                    props.className,
                  )}
                  {...props}
                />
              </pre>
            );
          },
          ol(props) {
            return <ol className="ml-4 list-decimal" {...props} />;
          },
          h1(props) {
            return <h1 className="font-medium" {...props} />;
          },
          h2(props) {
            return <h2 className="font-medium" {...props} />;
          },
          h3(props) {
            return <h3 className="font-medium" {...props} />;
          },
          h4(props) {
            return <h4 className="font-medium" {...props} />;
          },
          h5(props) {
            return <h5 className="font-medium" {...props} />;
          },
          h6(props) {
            return <h6 className="font-medium" {...props} />;
          },
          ul(props) {
            return <ul className="ml-4 list-disc" {...props} />;
          },
        }}
      />
    );
  });
}

/**
 * NOTE: This is a loose approximation of markdown links that should work for
 *       our use cases. If we need to be more rigorous follow the markdown guide:
 *       https://www.markdownguide.org/basic-syntax/#links
 */
function isMarkdownLink(text: string, start: number, end: number) {
  // assume any link in ](...) is already in markdown format
  const isStandardLink =
    text[start - 2] === ']' && text[start - 1] === '(' && text[end] === ')';

  // ignore links used as name of link in markdown format
  // [..](
  const isLinkName =
    text[start - 1] === '[' && text[end] === ']' && text[end + 1] === '(';

  // when the name of the md link is also a link, linkifyjs captures it as one link
  // ex: [link](link) -> "link](link"
  const isConcatedLink = text.includes('](');

  // assume any link in <...> is already in markdown format
  // NOTE: react-markdown doesn't seem to render these as links so for now pass
  //       along to linkify.
  //
  // const isAngleBracketLink = text[start - 1] === '<' && text[end] === '>'

  // we don't render raw html so we shouldn't allow links in this format.
  // but in case we do leave as is
  const isATagLink = text.substring(start - 6, start) === 'href="';

  return isStandardLink || isLinkName || isConcatedLink || isATagLink;
}

/**
 * Formats raw links in a given text to markdown format.
 *
 * This function identifies URLs in the input text and converts them into markdown links.
 * It handles various formats of URLs including those with query parameters, fragments,
 * and even those without protocols or subdomains. It also ensures that links already
 * in markdown format are not modified and excludes certain domains from being converted.
 *
 * @param text - The input text containing raw links.
 * @returns - The text with links formatted in markdown.
 *
 * @example
 * // Basic link conversion
 * const link = 'here is a neat link https://www.example.com/';
 * const markdownLink = formatLinksToMarkdown(link);
 * // Returns: 'here is a neat link [https://www.example.com/](https://www.example.com/)'
 */
function formatLinksToMarkdown(text: string) {
  const links = linkify
    .find(text, { defaultProtocol: 'https' })
    .filter(({ isLink, start, end, value }) => {
      // exclude links in markdown format
      return isLink && !isMarkdownLink(text, start, end);
    });

  if (!links.length) {
    return text;
  }

  // Split text into sections surrounding the links and insert fromatted links
  const { sections } = links.reduce(
    (acc, link, linkIdx) => {
      const before = text.slice(acc.textIdx, link.start);
      acc.sections.push(before);

      const markdownLink = `[${link.value}](${link.href})`;
      acc.sections.push(markdownLink);

      if (linkIdx === links.length - 1) {
        const after = text.slice(link.end, text.length);
        acc.sections.push(after);
      }

      acc.textIdx = link.end;

      return acc;
    },
    {
      sections: [] as string[],
      textIdx: 0,
    },
  );

  return sections.join('');
}

function formatNewlinesToMarkdown(text: string) {
  let newText = text;

  // Extract code blocks from the text
  const codeBlocks: string[] = [];
  const codeBlockRegex = /```[\s\S]*?```\n/g;
  let match;
  while ((match = codeBlockRegex.exec(newText)) !== null) {
    codeBlocks.push(match[0]);
  }

  // Replace code blocks with a placeholder
  newText = newText.replace(codeBlockRegex, '$CODEBLOCK$');

  // Replace multi newlines with placeholder
  newText = markLineBreaks(newText);

  // Replace single newlines with markdown newlines
  newText = newText.replace(/\n/g, '&nbsp;  \n');

  // Replace code block placeholders with the original code blocks
  codeBlocks.forEach((codeBlock) => {
    newText = newText.replace('$CODEBLOCK$', codeBlock);
  });

  return newText;
}

/**
 * Adds placeholders for line breaks.
 */
function markLineBreaks(text: string) {
  let newText = text;
  let match: RegExpExecArray | null = null;

  const emptyLines: string[] = [];
  const emptyLineRegex = /\n\n(\n*)/g;

  // Extract multi newlines from text
  while ((match = emptyLineRegex.exec(newText)) !== null) {
    emptyLines.push(match[0]);
  }

  // Replace multi newlines with placeholder
  newText = newText.replace(/\n\n(\n*)/g, '$BR$');

  // Replace empty line placeholders
  emptyLines.forEach((emptyLine) => {
    const lines = emptyLine.replace(/ */g, '').length;
    const emptyLineStr = repeat(LINEBREAK, lines);
    newText = newText.replace('$BR$', emptyLineStr);
  });

  return newText;
}

function repeat(str: string, times: number) {
  return Array(times).fill(str).join('');
}
