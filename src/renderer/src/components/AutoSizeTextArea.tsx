import React from 'react';

const AutoSizeTextArea = (
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) => {
  const { value } = props;
  const textareaElement = React.useRef<HTMLTextAreaElement>(null);

  const updateTextareaHeight = () => {
    if (textareaElement.current) {
      const $element = textareaElement.current;

      $element.style.height = 'auto';
      $element.style.height = `${$element.scrollHeight}px`;
      $element.style.resize = 'none';
    }
  };

  React.useEffect(() => {
    updateTextareaHeight();
  }, [value]);

  return <textarea ref={textareaElement} {...props} />;
};

export default AutoSizeTextArea;
