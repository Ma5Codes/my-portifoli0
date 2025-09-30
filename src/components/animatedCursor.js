import React from 'react';
import AnimatedCursor from 'react-animated-cursor';

const CustomAnimatedCursor = () => {
  return (
    <AnimatedCursor
      innerSize={8}
      outerSize={35}
      color='100, 255, 218'
      outerAlpha={0.2}
      innerScale={0.7}
      outerScale={1.7}
      trailingSpeed={8}
      clickables={[
        'a',
        'input[type="text"]',
        'input[type="email"]',
        'input[type="number"]',
        'input[type="submit"]',
        'input[type="image"]',
        'label[for]',
        'select',
        'textarea',
        'button',
        '.link',
        '[role="button"]',
        '[role="link"]',
        '[data-cursor]'
      ]}
      outerStyle={{
        border: '2px solid rgba(100, 255, 218, 0.3)',
        backgroundColor: 'transparent',
        mixBlendMode: 'difference'
      }}
      innerStyle={{
        backgroundColor: 'rgba(100, 255, 218, 1)',
        mixBlendMode: 'difference'
      }}
    />
  );
};

export default CustomAnimatedCursor;
