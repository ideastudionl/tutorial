import React from 'react';
import { Composition, Still } from 'remotion';
import { OgImage } from './OgImage';
import { Uitleg } from './Uitleg';
import { SocialPost } from './SocialPost';

export const RemotionRoot: React.FC = () => (
  <>
    <Still
      id="OgImage"
      component={OgImage}
      width={1200}
      height={630}
      defaultProps={{
        eyebrow: 'Stukadoor Amsterdam',
        title: 'Strak stucwerk dat jaren mooi blijft',
        price: 'vanaf € 16,00 per m²',
        rating: '9,4 uit 87 reviews',
      }}
    />

    <Composition
      id="Uitleg"
      component={Uitleg}
      durationInFrames={20 * 30}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{}}
    />

    <Composition
      id="SocialPost"
      component={SocialPost}
      durationInFrames={12 * 30}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        titel: 'Stucwerk nodig?',
        prijs: 'vanaf € 16,00 per m²',
        plaats: 'Amsterdam',
      }}
    />
  </>
);
