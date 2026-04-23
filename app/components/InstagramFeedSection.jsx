import {useEffect, useRef, useState} from 'react';
import {useNonce} from '@shopify/hydrogen';

const INSTAGRAM_PROFILE_URL = 'https://instagram.com/pixel.zones';
const INSTAGRAM_WIDGET_ID = 'GSC-VBMlYlrniwZwsnY';
const INSTAGRAM_WIDGET_INSTANCE_ID =
  'Aa3hkWW1md2pMT0FPY__gsc_instagram_feed_instafeed_PctyXi';
const INSTAGRAM_SECTION_ID =
  'shopify-section-template--25201153769779__1763578844b3ecc611';
const INSTAGRAM_BLOCK_ID =
  'shopify-block-Aa3hkWW1md2pMT0FPY__gsc_instagram_feed_instafeed_PctyXi';
const INSTAGRAM_USERNAME = 'pixel.zones';
const INSTAGRAM_AVATAR_URL =
  'https://scontent-iad3-1.cdninstagram.com/v/t51.82787-19/615006492_18034821095754206_6243383907067935488_n.jpg?stp=dst-jpg_s206x206_tt6&_nc_cat=108&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=BT0-OdwtockQ7kNvwFYO353&_nc_oc=Adoeic9TCV5GR6pzF2dIERlzvwtC_Fn6MVHKWEfxwVUC6bj_YWqNVt_MZFQ5C8MODWM&_nc_zt=24&_nc_ht=scontent-iad3-1.cdninstagram.com&edm=AP4hL3IEAAAA&_nc_gid=lghw8Rx2InKDz5pHe1vY7A&_nc_tpa=Q5bMBQEqAac_UK87ybI-66CUQVMcBhyNBldSmj4t_spHbeqg3iu1C1jpcQ5nhZ2sfGnqdek4q0kJoHtr&oh=00_Af1JSvgAeRvQ8ZitS38IfT_XAtP84aH2YIGGK3gCkdiB9Q&oe=69E0D96D';

const INSTAGRAM_WIDGET_MEDIA = [
  {
    id: '17883315126536871',
    mediaType: 'VIDEO',
    mediaUrl:
      'https://scontent-iad6-1.cdninstagram.com/o1/v/t2/f2/m86/AQPSyzmUZi8kGkaHcWITSIX_rLEJbwY7EwJ1XkyYwo1fVh1GhVctKXWal4mfQva-RLXfCoGsdZaq1ukUqfgeDbTuB2BiKPoWzdu8xFs.mp4?_nc_cat=107&_nc_sid=5e9851&_nc_ht=scontent-iad6-1.cdninstagram.com&_nc_ohc=5rf8PDzhOJIQ7kNvwEGMORc&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NzQwNTUwODk1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjoxLCJ2aV91c2VjYXNlX2lkIjoxMDA5OSwiZHVyYXRpb25fcyI6ODksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=bc4742d7f2141b53&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC85NDRDNzU2QjJFQjA1Rjk5NDE2RTk3OUE2MjgzRjQ4Q192aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzgyNDY2RjA4RUYyRTQ3RTQ2MTFCQTg1MTlEMDE2M0JEX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbol_2E-JbAPxUCKAJDMywXQFZDAgxJul4YEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=m20I3bIQuZh7jAF49Ssk-g&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQEK3fbNrGIXxFbvQByB9Y9Ny26z7hLFxf3JL4N7UPnmzR00goAdZzBxWV2cGoDge5EUe34rQJNd&oh=00_Af1BBoAwvu7Bzx4B31h0Sd7WSNY_ptkLHtWiVJAR4iwkgA&oe=69EB7A18',
    permalink: 'https://www.instagram.com/reel/DXZdDPMDKXn/',
    timestamp: '2026-04-21T14:53:19+0000',
    caption:
      '#Decoded Just Landed! Real leather. Strong colors and unique character.',
    likeCount: 55,
    commentsCount: 6,
    username: INSTAGRAM_USERNAME,
    avatarUrl: INSTAGRAM_AVATAR_URL,
    thumbnailUrl:
      'https://scontent-iad3-1.cdninstagram.com/v/t51.82787-15/671269166_18046980110754206_5447433913377711881_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=104&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=RpDzoh6111IQ7kNvwGR8Phc&_nc_oc=AdqzvfrXaVHIMo1lfy0p2JEHHGY8yVnTrfjyDeppebfd-yg7Hjfp_gNVWZX7jEX_wEM&_nc_zt=23&_nc_ht=scontent-iad3-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=m20I3bIQuZh7jAF49Ssk-g&_nc_tpa=Q5bMBQHb9tLnSs6yOKq_-8gYZJFXSalzOGi3rQx5TGndld8j1HtiTIS1FpBPSuWPrWmRAhj4w68Hn1Gt&oh=00_Af0GEwLSaFy0u0bsMNkzz2mdE3saZnPfNDmGVwDGjsWyDA&oe=69EF7E6D',
    children: null,
    isSharedToFeed: true,
  },
  {
    id: '18002360498876086',
    mediaType: 'VIDEO',
    mediaUrl:
      'https://scontent-iad3-2.cdninstagram.com/o1/v/t2/f2/m86/AQNXqWvMACpKXuswR7e_ueUjPy9-qjIpIfSlGAa-jSjh1PaDE2HalOTUw986Vljy5CDQCLIUrst7yoidv2uuB0Q8OSuKeo7-9ewpolY.mp4?_nc_cat=105&_nc_sid=5e9851&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_ohc=V8Wz2bvKJw8Q7kNvwH0P7wD&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NzExMTk0NTE1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjo3LCJ2aV91c2VjYXNlX2lkIjoxMDA5OSwiZHVyYXRpb25fcyI6ODksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=6a94bf086c311a06&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC8wOTQ5QUMwOEIyREEwNURCNDRDMjgzRDA2QUVERTE5RV92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzQ2NDE0QTMwMzVGRTMyNkQ1OEI2NjdFMTdBRTM4MUE3X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbokbXqh-y-PxUCKAJDMywXQFZtT987ZFoYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=9Q0qtLxv-rYsuSi4w4NlXw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQHVnZW31yNmwRCxK49FqrGcZ1pBKjxXVLtn909tY0yejZBooEg-cXjC6RxCohCTsfVwz8-5rd6z&oh=00_Af0wrL5kfTgKPFoBHz_B3NPBFJ0b-vMeET0kvlD_YaY4Nw&oe=69DCF566',
    permalink: 'https://www.instagram.com/reel/DWtVRa9DEy_/',
    timestamp: '2026-04-04T11:37:45+0000',
    caption:
      'You are not supposed to hang weight on a charging cable, but we tried it anyway.',
    likeCount: 98,
    commentsCount: 16,
    username: INSTAGRAM_USERNAME,
    avatarUrl: INSTAGRAM_AVATAR_URL,
    thumbnailUrl:
      'https://scontent-iad6-1.cdninstagram.com/v/t51.82787-15/662201472_18044884832754206_4231481518983271163_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=100&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=uiEbjXSAE40Q7kNvwHgxH8e&_nc_oc=Adoj-IWHVQuYmiIQCfSin8w_A6VcBIKE8WvDBCfx14IzR9gLlI66GNnoG7j-0qVLAvU&_nc_zt=23&_nc_ht=scontent-iad6-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=9Q0qtLxv-rYsuSi4w4NlXw&_nc_tpa=Q5bMBQGzjpjtrgfi0XqOar9alAJxRfvTd4zvtrSmJPOhg65_dCNjEGZXMvEPVhr7XzDagnRY_rsJsCNT&oh=00_Af0yRRiX_20zchhXiowkl8QubhbC01uuxKjT_y8K_CWNoQ&oe=69E0FB88',
    children: null,
    isSharedToFeed: true,
  },
  {
    id: '18079562744588610',
    mediaType: 'VIDEO',
    mediaUrl:
      'https://scontent-iad3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPKCNJnDhd1mlB8AyISjPwI1ZidlH7Lbr5N79BkvQ_c7CSJBTN1yKGM23iOvqc1Z2g45kR_yqmgVFE99XYxSHMD.mp4?strext=1&_nc_cat=103&_nc_sid=5e9851&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_ohc=lXNKp7HmrRMQ7kNvwGE1qsI&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NjM2NTYwMDk1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjo0OSwidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjk5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=9a54c30c8ecd7acd&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HQWdNSGliREpiNHNEdTRGQUVfVU1nUVZGZDRxYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzUwNEI2NDQ4OTBGNjBDM0IxNDlGRjAyMTAyNDg2OEE3X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbo77vt0Lm7PxUCKAJDMywXQFj5BiTdLxsYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=9Q0qtLxv-rYsuSi4w4NlXw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQES6y_rXcPAy4CTSiQ8wzVNdTJFogK1yRAzI-cyKCTcFeQ5zp4QYJU60tlyQKgiGCfMxfOimR8N&oh=00_Af0bWk8ltTmMD-QejGxsdzzLRnuvmIbhH780zEq6iyeweA&oe=69E10669',
    permalink: 'https://www.instagram.com/reel/DVBc6j2DD00/',
    timestamp: '2026-02-21T14:07:54+0000',
    caption:
      'JBL entered gaming and they are serious. Quantum 100 and 400 review.',
    likeCount: 28,
    commentsCount: 1,
    username: INSTAGRAM_USERNAME,
    avatarUrl: INSTAGRAM_AVATAR_URL,
    thumbnailUrl:
      'https://scontent-iad3-1.cdninstagram.com/v/t51.82787-15/640954076_18039335126754206_4313065391517093544_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=110&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=hbBiWos0W7MQ7kNvwHpFCVr&_nc_oc=AdpobnlGUNYCSGQrN2g0NyqZ-_grJNYEsQuEpJVEqYb59be8Ki-ZLZ7Op1dGsd1RO5E&_nc_zt=23&_nc_ht=scontent-iad3-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=9Q0qtLxv-rYsuSi4w4NlXw&_nc_tpa=Q5bMBQHhSQBbHQWceTUtTNluBywP5GMSoshDTV2cAp150nWb84ghvYy4idFP5rMx1jAyGA5h7h4C0otS&oh=00_Af33Tisi0S43RRsPZSkntgvIrS4WGlKUr7vjmr4j17Dn1w&oe=69E0FEB2',
    children: null,
    isSharedToFeed: true,
  },
  {
    id: '18430966150142013',
    mediaType: 'VIDEO',
    mediaUrl:
      'https://scontent-iad6-1.cdninstagram.com/o1/v/t16/f2/m69/AQNpT9dw7nF6YRm5n9kPifMXJJm8Gku7pQoXuKefB1PZFunokQUvPBmDaca3VYZ0Trte_O0cEAgzHW8re3nRZ6b3.mp4?strext=1&_nc_cat=102&_nc_sid=5e9851&_nc_ht=scontent-iad6-1.cdninstagram.com&_nc_ohc=BefXMfRCi2EQ7kNvwGjoSx_&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NjMwNDMyMDg1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjo1MywidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjY3LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=dc61b8f4dbbd7b0f&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HQlFjOHlWcnNWM19oMWdEQUpyLWtYdE5vamNQYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzlBNDcyQ0QzQzcxNDE5NDkzQjI3MDI0NjMxOEYwODhGX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbopvKQ-5W7PxUCKAJDMywXQFDO6XjU_fQYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=9Q0qtLxv-rYsuSi4w4NlXw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQEV_6BGa8wO2ezE4-ztB6J8nhIikRvDoZIIQd8eOopwG6ayJmtUoTPT5OxKpk7cp7daZAe5ULOs&oh=00_Af3emsk31VToahWpNd8TUq8N2H8p3otY0yWsGDsuoeqPoQ&oe=69E0F0E2',
    permalink: 'https://www.instagram.com/reel/DU2xUeODKP5/',
    timestamp: '2026-02-17T10:33:50+0000',
    caption: 'This tiny SSD is insanely fast. Powerology VaultX review.',
    likeCount: 53,
    commentsCount: 7,
    username: INSTAGRAM_USERNAME,
    avatarUrl: INSTAGRAM_AVATAR_URL,
    thumbnailUrl:
      'https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/631892711_18038856410754206_3514005443106549030_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=111&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=Uxsz98U9HYMQ7kNvwGDDnOp&_nc_oc=AdqsShunMCYbAaMJI1W-Z1Cw8pDsufku8a7xOAJtb0McB9ta6a-mEHjfDZkqBhMMQpE&_nc_zt=23&_nc_ht=scontent-iad3-2.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=9Q0qtLxv-rYsuSi4w4NlXw&_nc_tpa=Q5bMBQGjMUlHpGXJyLN9VrmxiQqrQ__ceQecNhvVqcBKu4x3SKZucOxxXjwiTnpHKrlv0blr09uOf--d&oh=00_Af3D1qCktDnWa2TVeapzsUXbXq7JVkKgOP_4JIJtOMiNjw&oe=69E0F851',
    children: null,
    isSharedToFeed: true,
  },
  {
    id: '17865398568571805',
    mediaType: 'VIDEO',
    mediaUrl:
      'https://scontent-iad6-1.cdninstagram.com/o1/v/t16/f2/m69/AQO0juP7E3ZSFoRiyYqQqB19Wkcg9yjC_4-LJ0yiy3NvqEyBiCKz80OTYvfkAqUIJMpkGoY9LoT-nopSh-DTlJ8N.mp4?strext=1&_nc_cat=107&_nc_sid=5e9851&_nc_ht=scontent-iad6-1.cdninstagram.com&_nc_ohc=hcS5S5tVWBgQ7kNvwHjYaWC&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NjI1ODcyODM1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjo1NiwidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjExLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=31205127fb357ff6&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HRGVpWlNWVUYzRmFxdWtMQUUyZ2Z1d080MEVGYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyL0ZBNDRFMTAyRDE5OEZBNzc2M0Y3MTE1RkE3QzAxQTk5X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACboifectvu6PxUCKAJDMywXQCewo9cKPXEYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=9Q0qtLxv-rYsuSi4w4NlXw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQGYKEDD6dHPq_l9W7MLIsxB-v7uzv4jk6ACFZy7FDRs6VaKWcET9O4qPXAGTU_gZVqB6560EI20&oh=00_Af0yv4CaIxKkP10xDvn9xMUDFWgRHz63rzdIzKDjt7DMfg&oe=69E0FECD',
    permalink: 'https://www.instagram.com/reel/DUvcxKgjJXB/',
    timestamp: '2026-02-14T14:19:47+0000',
    caption: 'Happy Valentines.',
    likeCount: 100,
    commentsCount: 21,
    username: INSTAGRAM_USERNAME,
    avatarUrl: INSTAGRAM_AVATAR_URL,
    thumbnailUrl:
      'https://scontent-iad6-1.cdninstagram.com/v/t51.71878-15/628079389_887352410721279_7839436118117884873_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=102&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=8H0iWVgV65oQ7kNvwGOcQkN&_nc_oc=Adoi8tefjB2CFOMuuZXWWJOZG9I3S3MPYC81AjyRPxrnsUcdl2fHU21-WXJ68cc49vc&_nc_zt=23&_nc_ht=scontent-iad6-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=9Q0qtLxv-rYsuSi4w4NlXw&_nc_tpa=Q5bMBQETSjsvZtAOEijvNU2-683l6bOjDczs_sPunSvUBQnxa9jv6lViHBeXwbYLLv_PRcRg3m6SrDfH&oh=00_Af157xh7G4tp_qcvqpVyVg1jaK17rULTSDpSmn2vvg51Aw&oe=69E0E50D',
    children: null,
    isSharedToFeed: true,
  },
  {
    id: '18102975739848349',
    mediaType: 'VIDEO',
    mediaUrl:
      'https://scontent-iad6-1.cdninstagram.com/o1/v/t16/f2/m69/AQMHUvfHsDHN-DqChNUcn5ZLAWq1w80Q-WJlzCCalJpuoNzmgC2o9qXmJRHFdDFOyBQj-WuogC_dJevDuLJx1Na4.mp4?strext=1&_nc_cat=106&_nc_sid=5e9851&_nc_ht=scontent-iad6-1.cdninstagram.com&_nc_ohc=0su7omINf8YQ7kNvwHLluWK&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NjE5NjgxODI1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjo2MCwidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjQ5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=432857ef79aef48c&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HQU5XbWlYbUZkaHBiLXNDQUxUSkpQNUJYVEFBYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyL0NBNDI5OThENDlFRDY4ODBENjE0OUEwMzlBQjA1NTgxX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACboxJrIsde6PxUCKAJDMywXQEiGJN0vGqAYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=9Q0qtLxv-rYsuSi4w4NlXw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQG42_RqejQuwdI04GNA7UPhdzEHuZAlfVAY1NNr2sb2jBWaN2L4o55EiLh_AIr7dAwFMT-jTaAr&oh=00_Af3hVVAeyqpufXGN9hcycCqeShiD2tzegeZEpJL1EO6hKg&oe=69E107AE',
    permalink: 'https://www.instagram.com/reel/DUkzI1-jJCZ/',
    timestamp: '2026-02-10T11:02:30+0000',
    caption:
      'Tuya smart RGB bulb review. The cheapest smart lighting upgrade for your home.',
    likeCount: 44,
    commentsCount: 0,
    username: INSTAGRAM_USERNAME,
    avatarUrl: INSTAGRAM_AVATAR_URL,
    thumbnailUrl:
      'https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/631744586_18038087774754206_1046467975625761204_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=103&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=iR8iMFaRnBEQ7kNvwFm4dpg&_nc_oc=Ado0_WHojTc_t5DjUxMBAZ6-PsucY8vLq9XfGrAlPrRkkVkkTlc_fRJ5kL7phdf35eU&_nc_zt=23&_nc_ht=scontent-iad3-2.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=9Q0qtLxv-rYsuSi4w4NlXw&_nc_tpa=Q5bMBQF8Vc9VnMlSrmQYwH7BNQvtFPkMZfHebugiYUWdIBP3UtwRQ-dwWxiD159iaPfkWfEkdRWcFqcA&oh=00_Af2EWP-nRNgpGwQRp48OHCKeUc9g22caJgEz1GvaWY6MSA&oe=69E0E10C',
    children: null,
    isSharedToFeed: true,
  },
  {
    id: '18093664982066845',
    mediaType: 'VIDEO',
    mediaUrl:
      'https://scontent-iad3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNrfTFacHGtd-vKYegUgm87Q331lPon_Q0Pic85LT52NyRs9Qru-zMAXtaEgohtATZIK6k97nBQP1ETyzrMCadd.mp4?strext=1&_nc_cat=110&_nc_sid=5e9851&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_ohc=HVLMSnPf-m8Q7kNvwGkCIhp&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NjE1NTQzMzU1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjo2MywidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjEyMiwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&ccb=17-1&vs=5553493118d36c65&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HTV9nV3lYTUNqbnM0WnNGQU1BaVFBelJnNjFNYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyL0RDNDZCRjQ5QTVCN0I0OEUyQkUxQ0M0Q0EwODUzQjgwX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbo9fmUpr-6PxUCKAJDMywXQF69T987ZFoYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=9Q0qtLxv-rYsuSi4w4NlXw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQHXvQFq3K6TrhD09UqZVkbjzcqKZ-S8ZKVBVBkwnWpIwJZtOsH_B_PTyhahVsrvYZR2NYWs9zTZ&oh=00_Af0pbF96Oq-5smjaUNjcwBaKAEQyWOrdrtwXE2LGzTVL_g&oe=69E10FDE',
    permalink: 'https://www.instagram.com/reel/DUdUcSwjACF/',
    timestamp: '2026-02-07T13:21:31+0000',
    caption:
      'Transparent headphones that actually sound premium. Nothing Headphone (1).',
    likeCount: 101,
    commentsCount: 14,
    username: INSTAGRAM_USERNAME,
    avatarUrl: INSTAGRAM_AVATAR_URL,
    thumbnailUrl:
      'https://scontent-iad3-1.cdninstagram.com/v/t51.82787-15/631086259_18037792721754206_2991813609133160428_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=101&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=lH3ddzvQ7dcQ7kNvwFf_2_W&_nc_oc=AdrpKbUIZy54fSyvqQGFtDhkLfaEmJAC_faEXDkUAFKKuPDQ6d_5NhBfiAWvCoMwzbU&_nc_zt=23&_nc_ht=scontent-iad3-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=9Q0qtLxv-rYsuSi4w4NlXw&_nc_tpa=Q5bMBQFZewwQ3EPt7830gEF1BsTHqTLLK8GBrLzkmCGrslzy_63str6WNZXj2mOoxVouqNwrnAyKeJHt&oh=00_Af2sIQjZ_BgYR_jhhpphyDZVkuzXcUqs62nocZEsgBfpJQ&oe=69E0F12E',
    children: null,
    isSharedToFeed: true,
  },
  {
    id: '18098383699920535',
    mediaType: 'VIDEO',
    mediaUrl:
      'https://scontent-iad3-2.cdninstagram.com/o1/v/t2/f2/m86/AQO7nV62-obb8kiW_hmZ7Fb_Fpw2mzPboxKYJ1Gwtin4RsxnzNLPj2qmyy9qq2Zz-83YwW9R2GqIWi1qHtCwjBrj9cjE1UonDukReFc.mp4?_nc_cat=105&_nc_sid=5e9851&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_ohc=S-T12a7oOcwQ7kNvwEBGHw3&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NjAwODI3Mzk1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjo3MywidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjcxLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=fc3aeee798ab4634&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC9CMjQ0OUI2NUI0MTk0RUYzODMwMTE1NjREOTRBOUVBOV92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzQ2NDA1QURFNzFBQjE1OTVBRTUxMDhGNDc0ODA3M0I4X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACboqdL10em5PxUCKAJDMywXQFHki0OVgQYYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=9Q0qtLxv-rYsuSi4w4NlXw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQE8ZIYlwN5iQRtD7aQ0eLlJ-iOa3bslde3d0BTBk0u4mVSIdvdtTskgTIGHgfBeMlOnHFh6X-1Y&oh=00_Af2ahKllvM8IBGw7sFXyHxbleWokwU58zs_HwBUwrokdZA&oe=69DCF386',
    permalink: 'https://www.instagram.com/reel/DUDwbQSDDu5/',
    timestamp: '2026-01-28T15:05:12+0000',
    caption:
      'I thought these were Apple mugs. Turns out they are Lepresso tumblers.',
    likeCount: 52,
    commentsCount: 3,
    username: INSTAGRAM_USERNAME,
    avatarUrl: INSTAGRAM_AVATAR_URL,
    thumbnailUrl:
      'https://scontent-iad6-1.cdninstagram.com/v/t51.82787-15/623676242_18036760541754206_5383936569331954242_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=106&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=geThAMHe9YgQ7kNvwG8s5ad&_nc_oc=AdoHdxqQ16PPd3Mz8Vh1enMl9m86Jaz1JtmX5REZd1z-aafhU5l72Nui0gXs4gNeRRM&_nc_zt=23&_nc_ht=scontent-iad6-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=9Q0qtLxv-rYsuSi4w4NlXw&_nc_tpa=Q5bMBQFND7n-hSt61ZDiyEQ5dBq83YlgKjHHIPMU0ErksIl-RomgWgLjvnsgzkuIbzGX42eBssYUEvkM&oh=00_Af0KhMB7eJCIpAb4nu2riLXw424angCae_7ChrL7dPx0XQ&oe=69E102B3',
    children: null,
    isSharedToFeed: true,
  },
];

const INSTAGRAM_FALLBACK_FEED_ITEMS = [
  {
    id: '17863656009595892',
    likes: 28,
    comments: 1,
    video:
      'https://scontent-iad3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNpT9dw7nF6YRm5n9kPifMXJJm8Gku7pQoXuKefB1PZFunokQUvPBmDaca3VYZ0Trte_O0cEAgzHW8re3nRZ6b3.mp4?strext=1&_nc_cat=102&_nc_sid=5e9851&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_ohc=FrJ-Al81aLEQ7kNvwH1lHVe&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NjM2NTYwMDk1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjozMCwidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjY3LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=dc61b8f4dbbd7b0f&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HQlFjOHlWcnNWM19oMWdEQUpyLWtYdE5vamNQYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzlBNDcyQ0QzQzcxNDE5NDkzQjI3MDI0NjMxOEYwODhGX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbopvKQ-5W7PxUCKAJDMywXQFDO6XjU_fQYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQEPNWTzU6VAW1U9LsdEN93-nPaD7jfkdtjFb520X036c6COwbwmdDMMNd-jNq3k2gyuztnOVLrE&oh=00_AfxaI328HN7h2UrRRp_V70u-w-kecPRq0fijuZrEJFekqg&oe=69C26622',
    poster:
      'https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/631892711_18038856410754206_3514005443106549030_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=111&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=OT-gUtJsyAMQ7kNvwFtRPJy&_nc_oc=AdrzdM4xl8gznE7lC9K4SDA9uu0gwda1gMpx3I-XQaIR1yznZv0EsMflHTVcxGOTaJ0&_nc_zt=23&_nc_ht=scontent-iad3-2.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&_nc_tpa=Q5bMBQGS18xF1BnrvqMAFcPi1ts-VIyd9lnVoPh3pztpUkPOBchPRxzDV9ylaKU-7GnoclhtGs9cetcc&oh=00_AfwI73I1_COEZ-vURRPd7IwvTGSQ3ho2sflPsi1hBZKsIw&oe=69C26D91',
  },
  {
    id: '17863043208595892',
    likes: 53,
    comments: 7,
    video:
      'https://scontent-iad3-1.cdninstagram.com/o1/v/t16/f2/m69/AQO0juP7E3ZSFoRiyYqQqB19Wkcg9yjC_4-LJ0yiy3NvqEyBiCKz80OTYvfkAqUIJMpkGoY9LoT-nopSh-DTlJ8N.mp4?strext=1&_nc_cat=107&_nc_sid=5e9851&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_ohc=pSwmXAjR810Q7kNvwGvHBh2&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NjI1ODcyODM1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjozMywidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjExLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=31205127fb357ff6&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HRGVpWlNWVUYzRmFxdWtMQUUyZ2Z1d080MEVGYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyL0ZBNDRFMTAyRDE5OEZBNzc2M0Y3MTE1RkE3QzAxQTk5X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACboifectvu6PxUCKAJDMywXQCewo9cKPXEYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQHlzSdRODx7Pgt4lWGtXXa8uQS06dTvT7JXpTNl3jMFQNsHnXinSsKlXHved0DktNnjXt_EU5xf&oh=00_Afwv5cC8oJt90WLYsbc9uyy0KA0-QTy9ejLCX3Qkz4UejQ&oe=69C2740D',
    poster:
      'https://scontent-iad3-1.cdninstagram.com/v/t51.71878-15/628079389_887352410721279_7839436118117884873_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=102&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=hr_-CU5C6DcQ7kNvwEgJhSP&_nc_oc=Adot09M0yuWD1vuTinpKBGjNw4cEjkItr8ch0qFowc_T3sxn1kZcbpkOq3yawhSKv0A&_nc_zt=23&_nc_ht=scontent-iad3-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&_nc_tpa=Q5bMBQFq43AZN17kL8X6Y1CmXGH6qXqvgvvfJOiMqipCYWhGn9Ph_BKFflo6yE4JP7wKXXA-fANa5P6Y&oh=00_AfwV6qzlll4HwUXkTfwFOifDMTvpsF4YLcdN0Bj4PdJYfw&oe=69C25A4D',
  },
  {
    id: '17862587283595892',
    likes: 100,
    comments: 21,
    video:
      'https://scontent-iad3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMHUvfHsDHN-DqChNUcn5ZLAWq1w80Q-WJlzCCalJpuoNzmgC2o9qXmJRHFdDFOyBQj-WuogC_dJevDuLJx1Na4.mp4?strext=1&_nc_cat=106&_nc_sid=5e9851&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_ohc=eCVRuoAVCYoQ7kNvwG_6QSn&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NjE5NjgxODI1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjozNywidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjQ5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=432857ef79aef48c&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HQU5XbWlYbUZkaHBiLXNDQUxUSkpQNUJYVEFBYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyL0NBNDI5OThENDlFRDY4ODBENjE0OUEwMzlBQjA1NTgxX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACboxJrIsde6PxUCKAJDMywXQEiGJN0vGqAYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQFdYjfUPDcY9NYSnCrPk0KKJuL9hKvMsLSjcRicrkccoXX8l1rYBqf_i-pkTvOqVDN5LacSblyE&oh=00_Afx_S2XWeQ9-QfWZVstC-CGNxSul4iCghu3_4jqnL6rJng&oe=69C27CEE',
    poster:
      'https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/631744586_18038087774754206_1046467975625761204_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=103&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=80AeefYRYXcQ7kNvwGNc9e8&_nc_oc=AdoBJNntYpLwF9XLAZVP-xgLRTrsp0BG72sa7QknkzRLRH-czK6Wzr9bQPyqV96uSUU&_nc_zt=23&_nc_ht=scontent-iad3-2.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&_nc_tpa=Q5bMBQHAaIXFKv0N6Wf4gSvF9ckPgTlFQ1sKrr2dog0q2TrgYmcBblBbcvF6ye4zjgHUF86iqGEPi_o6&oh=00_Afz9DWxUJBr6Loin_dPS_0OuCjn_-s5g3r-MpWQFS5f7gg&oe=69C28E8C',
  },
  {
    id: '17861968182595892',
    likes: 44,
    comments: 0,
    video:
      'https://scontent-iad3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNrfTFacHGtd-vKYegUgm87Q331lPon_Q0Pic85LT52NyRs9Qru-zMAXtaEgohtATZIK6k97nBQP1ETyzrMCadd.mp4?strext=1&_nc_cat=110&_nc_sid=5e9851&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_ohc=Q0DjlrFnoGYQ7kNvwHE6ZHy&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NjE1NTQzMzU1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjo0MCwidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjEyMiwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&ccb=17-1&vs=5553493118d36c65&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HTV9nV3lYTUNqbnM0WnNGQU1BaVFBelJnNjFNYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyL0RDNDZCRjQ5QTVCN0I0OEUyQkUxQ0M0Q0EwODUzQjgwX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbo9fmUpr-6PxUCKAJDMywXQF69T987ZFoYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQEE83-nNC5i5eUDStjc_aKYvBEN80yugAxx2Y1eJ8haT9fbrltr2ChgfsbSTL9OTni44cKh3l50&oh=00_AfwVIt_MMf8yOxqWhB3aiP8jyGWusse5zLo6PgeWJc_BZQ&oe=69C2851E',
    poster:
      'https://scontent-iad3-1.cdninstagram.com/v/t51.82787-15/631086259_18037792721754206_2991813609133160428_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=101&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=3Wx6AvqirfIQ7kNvwGBER5Z&_nc_oc=AdqU2x60vJ_GtByM47UzdX3xxKoxedaV2GUa0jbfuTkf9rJyeHZSHmxdWG-1geEHK1c&_nc_zt=23&_nc_ht=scontent-iad3-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&_nc_tpa=Q5bMBQHnHRkyj1DC53zQ807DOlK1o7nyLvSq3Xv5qmAUTfdmwSPmS8p-MRnKuT-bg5GNQ1ylg9U9t2l_&oh=00_AfxgkcBCZ91w682lnq_GNUPBXdvLhnt19_S8IZOP33NE_w&oe=69C2666E',
  },
  {
    id: '17861554335595892',
    likes: 101,
    comments: 14,
    video:
      'https://scontent-iad3-2.cdninstagram.com/o1/v/t2/f2/m86/AQO7nV62-obb8kiW_hmZ7Fb_Fpw2mzPboxKYJ1Gwtin4RsxnzNLPj2qmyy9qq2Zz-83YwW9R2GqIWi1qHtCwjBrj9cjE1UonDukReFc.mp4?_nc_cat=105&_nc_sid=5e9851&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_ohc=5_jtcrXMTS0Q7kNvwEYydHS&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NjAwODI3Mzk1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjo1MCwidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjcxLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=fc3aeee798ab4634&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC9CMjQ0OUI2NUI0MTk0RUYzODMwMTE1NjREOTRBOUVBOV92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzQ2NDA1QURFNzFBQjE1OTVBRTUxMDhGNDc0ODA3M0I4X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACboqdL10em5PxUCKAJDMywXQFHki0OVgQYYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQHVLuY7Y6m8BeifojY9dhl8ej_uy_ethPBtDDBVlK9pEESv_7KlP8BUgUHBR7Cvt5AWfKRERH54&oh=00_AfzdfrRI4UoCcuW3unLWiAk6Go7ApT4zgERVjZOTa9Nyjw&oe=69BE68C6',
    poster:
      'https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/623676242_18036760541754206_5383936569331954242_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=106&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=ScIuMoPbIkcQ7kNvwGd6XeT&_nc_oc=AdpqpwiMKHbI4xlfCWQXcnegAA9dZPbCVrUXMAhHRTjDesa2c6EMeazxBBCLgFGqhR4&_nc_zt=23&_nc_ht=scontent-iad3-2.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&_nc_tpa=Q5bMBQFuT6yJwzxAqf06ME3MTHyeD22INw0X8SuUiRKadTMH29EEW6MoRi1Vow-J7oup9wuhOkFekhOv&oh=00_AfzDyFuKqtE0fH-TRkXX_uPJ3MNLguq7AaQ3x33IUyCgig&oe=69C277F3',
  },
  {
    id: '17860082739595892',
    likes: 52,
    comments: 3,
    video:
      'https://scontent-iad3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPHV3if5vggDrq0k9UXQIxj_AdJboBPrL0B11bnSCBCwKKvWGZBKkMn6SbPhfEVQbeoAOU595T1whcLptO4NX0x.mp4?strext=1&_nc_cat=110&_nc_sid=5e9851&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_ohc=LGX_LbYs7RIQ7kNvwE-HvJU&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NTkzNTY2MDE1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjo1NSwidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjc4LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=f34c3ae21a6a2d32&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HR0tjenlSQXZYWWNrNElGQUJfVEdjLTlkVTFwYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzI5NDQ3OTk1NDU3OUIyNEQxRjk1REE5RkRBRDIxNUI4X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbo373ir7-5PxUCKAJDMywXQFO8_fO2RaIYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQElb7a0dR59Z3I9OuY0NFzpZXjBmTHyMjadqJWvymeYcTT9tAh9Ukh-i4F9QaflQcIsyH6gSE8_&oh=00_AfzLt1p0DsqOKFTlZV5EgfeLV6Ps2C6PXyThQX3NHIAUVA&oe=69C263A2',
    poster:
      'https://scontent-iad3-1.cdninstagram.com/v/t51.82787-15/621765018_18036220475754206_4006842885459001104_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=110&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=N_4_OqaDwaMQ7kNvwGXnotJ&_nc_oc=AdrHhczUAp4vHL6lFHihxOTpquZtyma7gLNZfjPI8yxVD4S6EPf4xNS8ECYVChi6cK0&_nc_zt=23&_nc_ht=scontent-iad3-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&_nc_tpa=Q5bMBQFhbD2Tk7U-3Dsn6_5e7qJ3wLb_5U5Aw71MXoXoOk0sAWohu13CyhPB8BGp7HHyV6o3lUxXDGQf&oh=00_AfxEiUC-ok2ZhFivSIfLoVqnmthrcKZ4YpOgGKeFre9mwg&oe=69C25DF9',
  },
  {
    id: '17859356601595892',
    likes: 68,
    comments: 4,
    video:
      'https://scontent-iad3-1.cdninstagram.com/o1/v/t2/f2/m86/AQMXW1vV9_bdn2R4OUu8ABPEUOg625XFpfdezNdlXoIYedbc6IYqJiPY0fICI05ixq-Sk4luUwBIB9JRVBADy5fG08gjVpAOAGH6MH8.mp4?_nc_cat=107&_nc_sid=5e9851&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_ohc=2SlvLlSh4tUQ7kNvwFVBrAR&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTM4MDYzNDg5NzEzNTAwNCwiYXNzZXRfYWdlX2RheXMiOjU3LCJ2aV91c2VjYXNlX2lkIjoxMDgyNywiZHVyYXRpb25fcyI6NzIsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=c676188b07b709a1&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC83NTQ3NkQ1NEQyNTNCQkQ5MDcyMkVEQkY1Q0IyN0RCN192aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyL0I4NDBDNDI5QjY5MjI5QkIyN0EzQkFDQTkzQUI1NTg5X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACa41t3Jw-vzBBUCKAJDMywXQFIKn752yLQYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZZapAQA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQGaPp2Xp2OVA-dWQ-GS_XtyhVHSGpTL1iQQdo2Q8X2Q6FSwKNYBQyeIqP1OON5CNe2nv6sf1Bat&oh=00_AfyVEK6GeZz1pwNtaZhcKHPFhi3xIqvoMhP9ZTAaTdaaYQ&oe=69BE6C60',
    poster:
      'https://scontent-iad3-1.cdninstagram.com/v/t51.82787-15/619889944_18035964194754206_8821736132526546753_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=102&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=UOxHWwxFFOUQ7kNvwFWEL2n&_nc_oc=AdoXq9kB9uTZRKCX2kv9z8Xt23gIcoPdQwjR0Ld2ZsdKIjXCRIEW4qvau1lqfmMwetg&_nc_zt=23&_nc_ht=scontent-iad3-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&_nc_tpa=Q5bMBQGTOiy7ZKWVFxfKNb-mbEcCr5R2RkyUABdqXDn1o9HiKYBO1DSb6UMDKxbAx0R6wckrUF36Q5hj&oh=00_Afyc9p2LghbOsGNxFeEJrvy-gmzu7WloMySW7bz6Unladw&oe=69C25DE6',
  },
  {
    id: '1380634897135004',
    likes: 602,
    comments: 37,
    video:
      'https://scontent-iad6-1.cdninstagram.com/o1/v/t2/f2/m86/AQMXW1vV9_bdn2R4OUu8ABPEUOg625XFpfdezNdlXoIYedbc6IYqJiPY0fICI05ixq-Sk4luUwBIB9JRVBADy5fG08gjVpAOAGH6MH8.mp4?_nc_cat=107&_nc_sid=5e9851&_nc_ht=scontent-iad6-1.cdninstagram.com&_nc_ohc=FD-QCn_sTY4Q7kNvwEDtKV-&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTM4MDYzNDg5NzEzNTAwNCwiYXNzZXRfYWdlX2RheXMiOjgwLCJ2aV91c2VjYXNlX2lkIjoxMDgyNywiZHVyYXRpb25fcyI6NzIsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=c676188b07b709a1&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC83NTQ3NkQ1NEQyNTNCQkQ5MDcyMkVEQkY1Q0IyN0RCN192aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyL0I4NDBDNDI5QjY5MjI5QkIyN0EzQkFDQTkzQUI1NTg5X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACa41t3Jw-vzBBUCKAJDMywXQFIKn752yLQYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZZapAQA&_nc_gid=9Q0qtLxv-rYsuSi4w4NlXw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQG18bRy8YvjotSqD_P6u8-ZbCmdyJ_8bJjbcsa2fTd1kCuGwv3JT3frUiAEkuGqpr6RitDKyUJ-&oh=00_Af2InMWNaq7c3NGEwzada3MYXypHS9qfBblv9f6GNjqxnw&oe=69DCF720',
    poster:
      'https://scontent-iad6-1.cdninstagram.com/v/t51.82787-15/619889944_18035964194754206_8821736132526546753_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=102&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=miV-5HS36OoQ7kNvwEF-xTu&_nc_oc=AdpfZw03LATJsosBoGpSjcVNjLbFLXw0sYblDDfI5OwuQMY3OmbhRdwGetGBm-60JiM&_nc_zt=23&_nc_ht=scontent-iad6-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=9Q0qtLxv-rYsuSi4w4NlXw&_nc_tpa=Q5bMBQGSr-lOL7jAgBPfh5O3CrIMnp5IEYKaY7I9J3N6psFhmG493ku_hbJL0qJmCtQ4nlcNtm3Iba8e&oh=00_Af1nZSkYKzmBYRMTafRj3PiTkmWe0rzB2-mhq2Op2OxkEg&oe=69E0E8A6',
  },
];

const INSTAGRAM_FEED_ITEMS = INSTAGRAM_WIDGET_MEDIA.length
  ? INSTAGRAM_WIDGET_MEDIA.map((item) => ({
      id: item.id,
      likes: item.likeCount,
      comments: item.commentsCount,
      video: item.mediaUrl,
      poster: item.thumbnailUrl,
    }))
  : INSTAGRAM_FALLBACK_FEED_ITEMS;

const INSTAGRAM_WIDGET_BOOTSTRAP = `(function() {
  if (!'${INSTAGRAM_WIDGET_ID}') {
    return;
  }

  const mf = ${JSON.stringify(INSTAGRAM_WIDGET_MEDIA)};
  const payload = {id: '${INSTAGRAM_WIDGET_ID}', data: mf};

  if (Array.isArray(window.GSC_INSTAFEED_MEDIA)) {
    const existingIndex = window.GSC_INSTAFEED_MEDIA.findIndex(
      (entry) => entry && entry.id === '${INSTAGRAM_WIDGET_ID}',
    );

    if (existingIndex >= 0) {
      window.GSC_INSTAFEED_MEDIA[existingIndex] = payload;
    } else {
      window.GSC_INSTAFEED_MEDIA.push(payload);
    }
  } else {
    window.GSC_INSTAFEED_MEDIA = [payload];
  }
}())`;

const WIDGET_STYLES = `
  .page-width.scroll-trigger.animate--slide-in {
    width: 100%;
  }

  .shopify-block.shopify-app-block {
    width: 100%;
  }

  .gfa-widget.GSC-VBMlYlrniwZwsnY {
    display: flex;
    justify-content: center;
    width: 100%;
    border-radius: 0;
    background: #ffffff;
    margin: 0;
    padding: 80px 20px;
    box-sizing: border-box;
    overflow: hidden;
    --gfa-content-max-width: 100%;
    --gfa-media-border-radius: 12px;
  }

  .gfa-content.GSC-VBMlYlrniwZwsnY {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    gap: 16px;
    width: 100%;
    max-width: var(--gfa-content-max-width, 100%);
  }

  .gfa-content__text.heading-jGjKbkcJqchH,
  .gfa-content__text.text-ZINqArAMvzSx {
    display: flex;
    flex-flow: column nowrap;
    width: min(100%, 100%);
    align-self: center;
  }

  .gfa-content__text.heading-jGjKbkcJqchH > h3 {
    margin: 0;
    padding: 0;
    text-align: center;
    font-size: 28px;
    font-weight: 600;
    line-height: 1.3;
    color: #000000;
  }

  .gfa-content__text.text-ZINqArAMvzSx > span {
    margin: 0;
    padding: 0 0 12px;
    text-align: center;
    font-size: 16px;
    font-weight: 400;
    line-height: 1.3;
    color: #616161;
  }

  .gfa-carousel.GSC-VBMlYlrniwZwsnY {
    position: relative;
    display: flex;
    width: 100%;
    box-sizing: border-box;
    padding: 0;
  }

  .gfa-carousel__viewport.GSC-VBMlYlrniwZwsnY {
    width: 100%;
    box-sizing: border-box;
    overflow: visible;
  }

  .gfa-carousel__track.GSC-VBMlYlrniwZwsnY {
    display: flex;
    align-items: flex-start;
    overflow-x: auto;
    gap: 12px;
    width: 100%;
    padding: 0;
    scrollbar-width: none;
    scroll-behavior: smooth;
    user-select: none;
    -webkit-user-select: none;
    touch-action: pan-y;
  }

  .gfa-carousel__track.GSC-VBMlYlrniwZwsnY::-webkit-scrollbar {
    display: none;
  }

  .gfa-carousel__slide.GSC-VBMlYlrniwZwsnY {
    position: relative;
    flex: 0 0 calc(20% - 9.6px);
    min-width: calc(20% - 9.6px);
    scroll-snap-align: start;
    box-sizing: border-box;
    user-select: none;
    -webkit-user-select: none;
    pointer-events: none;
  }

  .gfa-carousel__slide-media.GSC-VBMlYlrniwZwsnY {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .gfa-media.GSC-VBMlYlrniwZwsnY {
    display: flex;
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    background-color: #0000003d;
    pointer-events: all;
    text-decoration: none;
  }

  .gfa-media.GSC-VBMlYlrniwZwsnY::before {
    content: '';
    display: block;
    width: 100%;
    padding-top: 177.7%;
  }

  .gfa-media__source {
    position: absolute;
    inset: 0;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    transition: transform 0.7s ease-in-out;
    user-select: none;
    -webkit-user-drag: none;
  }

  .gfa-media--zoom-media:hover .gfa-media__source,
  .gfa-media--zoom-media:focus-visible .gfa-media__source {
    transform: scale(1.1);
  }

  .gfa-media__overlay,
  .gfa-media__overlay-media-type {
    position: absolute;
    inset: 0;
    z-index: 1;
    padding: min(24px, 10%);
    user-select: none;
  }

  .gfa-media__overlay-media-type {
    display: flex;
    justify-content: flex-end;
    z-index: 2;
  }

  .gfa-media__overlay {
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-end;
    padding-bottom: min(20px, 10%);
    background-color: transparent;
    opacity: 0;
    transition: background-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
    color: #fff;
  }

  .gfa-media:hover .gfa-media__overlay,
  .gfa-media:focus-within .gfa-media__overlay {
    background-color: #00000059;
    opacity: 1;
  }

  .gfa-media__overlay-content {
    display: flex;
    flex-flow: column nowrap;
    gap: 16px;
    font-size: 14px;
    line-height: 20px;
    color: #fff;
    z-index: 2;
  }

  .gfa-media__inst-logo {
    position: absolute;
    z-index: 2;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 24px;
    height: 24px;
  }

  .gfa-media__meta {
    display: flex;
    flex-flow: column nowrap;
    gap: 8px;
  }

  .gfa-media__counters {
    display: flex;
    gap: 16px;
  }

  .gfa-media__counter {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    line-height: 20px;
    font-weight: 600;
    color: #fff;
  }

  .gfa-media__counter svg,
  .gfa-media__media-type svg {
    width: 20px;
    height: 20px;
  }

  .gfa-arrow-button {
    border: none;
    position: absolute;
    top: calc(50% - 20px);
    width: 44px;
    height: 44px;
    padding: 0;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 3;
    transition: opacity 0.25s, visibility 0.25s, transform 0.2s linear;
    opacity: 0;
    visibility: hidden;
    min-width: unset;
    box-shadow: none;
  }

  .gfa-arrow-button__haze {
    background:
      linear-gradient(
        0deg,
        var(--gfa-arrow-custom-bg, rgba(201, 201, 201, 0.2)) 0%,
        var(--gfa-arrow-custom-bg, rgba(201, 201, 201, 0.2)) 100%
      ),
      #fff;
    color: var(--gfa-arrow-custom-color, #000000);
  }

  .gfa-arrow-button:hover:not(:disabled) {
    cursor: pointer;
    transform: scale(1.1);
  }

  .gfa-arrow-button:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }

  .gfa-arrow-left {
    left: 24px;
  }

  .gfa-arrow-right {
    right: 24px;
  }

  .gfa-arrow-button--visible {
    opacity: 1;
    visibility: visible;
  }

  .gfa-content__button-container.button-oAWOBOllLYUW {
    width: auto;
    align-self: center;
  }

  .gfa-content__button.button-oAWOBOllLYUW {
    display: flex;
    justify-content: center;
    align-items: center;
    text-decoration: none !important;
    text-align: center;
    cursor: pointer;
    transition: color 0.2s ease, background-color 0.2s ease, opacity 0.2s ease;
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    padding: 16px 48px;
    margin: 12px 0 0;
    background: #000000;
    border: none;
    text-transform: unset;
    letter-spacing: 0;
    border-radius: 12px;
  }

  .gfa-content__button.button-oAWOBOllLYUW:hover {
    color: #ffffff !important;
    text-decoration: none !important;
    opacity: 0.9;
  }

  @media screen and (max-width: 768px) {
    .gfa-widget.GSC-VBMlYlrniwZwsnY {
      padding: 48px 16px;
      --gfa-media-border-radius: 8px;
    }

    .gfa-content.GSC-VBMlYlrniwZwsnY {
      gap: 12px;
    }

    .gfa-content__text.heading-jGjKbkcJqchH > h3 {
      font-size: 24px;
    }

    .gfa-content__text.text-ZINqArAMvzSx > span {
      font-size: 14px;
      padding-bottom: 8px;
    }

    .gfa-carousel__slide.GSC-VBMlYlrniwZwsnY {
      flex-basis: calc(50% - 6px);
      min-width: calc(50% - 6px);
    }

    .gfa-media.GSC-VBMlYlrniwZwsnY {
      border-radius: 8px;
    }

    .gfa-arrow-button {
      width: 32px;
      height: 32px;
      top: calc(50% - 16px);
    }

    .gfa-arrow-left {
      left: 12px;
    }

    .gfa-arrow-right {
      right: 12px;
    }

    .gfa-media__overlay-content {
      font-size: 12px;
      line-height: 16px;
    }

    .gfa-content__button.button-oAWOBOllLYUW {
      font-size: 13px;
      padding: 14px 32px;
      margin-top: 8px;
    }
  }
`;

export function InstagramFeedSection() {
  const nonce = useNonce();
  const trackRef = useRef(null);
  const videoRefs = useRef([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const updateScrollState = () => {
      setCanScrollPrev(track.scrollLeft > 4);
      setCanScrollNext(
        track.scrollLeft + track.clientWidth < track.scrollWidth - 4,
      );
    };

    updateScrollState();
    track.addEventListener('scroll', updateScrollState, {passive: true});
    window.addEventListener('resize', updateScrollState);

    return () => {
      track.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  const scrollCarousel = (direction) => {
    const track = trackRef.current;
    if (!track) return;

    const firstSlide = track.querySelector('.gfa-carousel__slide');
    const slideWidth =
      firstSlide?.getBoundingClientRect().width || track.clientWidth * 0.5;

    track.scrollBy({
      left: direction * (slideWidth + 12),
      behavior: 'smooth',
    });
  };

  const setVideoRef = (index) => (node) => {
    videoRefs.current[index] = node;
  };

  const playVideo = (index) => {
    const video = videoRefs.current[index];
    if (!video) return;
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }
  };

  const resetVideo = (index) => {
    const video = videoRefs.current[index];
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <section
      id={INSTAGRAM_SECTION_ID}
      className="shopify-section section pz-home-section pz-home-instagram"
      data-shopify-editor-section={JSON.stringify({
        id: 'template--25201153769779__1763578844b3ecc611',
        type: 'apps',
        disabled: false,
      })}
    >
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{__html: INSTAGRAM_WIDGET_BOOTSTRAP}}
      />
      <style nonce={nonce}>{WIDGET_STYLES}</style>
      <div className="page-width scroll-trigger animate--slide-in">
        <div
          id={INSTAGRAM_BLOCK_ID}
          className="shopify-block shopify-app-block"
          data-shopify-editor-block={JSON.stringify({
            id: 'template--25201153769779__1763578844b3ecc611__gsc_instagram_feed_instafeed_PctyXi',
            domId: 'Aa3hkWW1md2pMT0FPY__gsc_instagram_feed_instafeed_PctyXi',
            type: 'shopify://apps/gsc-instagram-feed/blocks/instafeed/96970b1b-b770-454f-b16b-51f47e1aa4ed',
            disabled: false,
          })}
        >
          <div
            className={`gfa-widget ${INSTAGRAM_WIDGET_ID}`}
            id={INSTAGRAM_WIDGET_INSTANCE_ID}
          >
            <div className={`gfa-content ${INSTAGRAM_WIDGET_ID}`}>
              <div className="gfa-content__text heading-jGjKbkcJqchH">
                <h3>Follow us on Instagram</h3>
              </div>
              <div className="gfa-content__text text-ZINqArAMvzSx">
                <span>
                  Join our community for daily inspiration and a closer look at our
                  creations
                </span>
              </div>

              <div className={`gfa-carousel gfa-carousel--effect-default ${INSTAGRAM_WIDGET_ID}`}>
                <div className={`gfa-carousel__viewport ${INSTAGRAM_WIDGET_ID}`}>
                  <div
                    ref={trackRef}
                    className={`gfa-carousel__track ${INSTAGRAM_WIDGET_ID} gfa-carousel__track--classic-running`}
                  >
                    {INSTAGRAM_FEED_ITEMS.map((item, index) => (
                      <div
                        key={item.id}
                        className={`gfa-carousel__slide ${INSTAGRAM_WIDGET_ID}`}
                      >
                        <div className={`gfa-carousel__slide-media ${INSTAGRAM_WIDGET_ID}`}>
                          <a
                            href={item.permalink || INSTAGRAM_PROFILE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`gfa-media ${INSTAGRAM_WIDGET_ID} gfa-media--zoom-media`}
                            onMouseEnter={() => playVideo(index)}
                            onMouseLeave={() => resetVideo(index)}
                            onFocus={() => playVideo(index)}
                            onBlur={() => resetVideo(index)}
                            aria-label={`Open Instagram reel ${index + 1}`}
                          >
                            <video
                              ref={setVideoRef(index)}
                              preload={index < 2 ? 'auto' : 'none'}
                              src={item.video}
                              playsInline
                              muted
                              loop
                              poster={item.poster}
                              className="gfa-media__source"
                            />
                            <div className="gfa-media__overlay-media-type">
                              <div className={`gfa-media__media-type ${INSTAGRAM_WIDGET_ID}`}>
                                <ReelIcon />
                              </div>
                            </div>
                            <div className={`gfa-media__overlay ${INSTAGRAM_WIDGET_ID}`}>
                              <div className={`gfa-media__inst-logo ${INSTAGRAM_WIDGET_ID}`}>
                                <InstagramPlayIcon />
                              </div>
                              <div
                                className={`gfa-media__overlay-content ${INSTAGRAM_WIDGET_ID}`}
                              >
                                <div className="gfa-media__meta">
                                  <div className="gfa-media__counters">
                                    <div className="gfa-media__counter">
                                      <HeartIcon />
                                      {item.likes}
                                    </div>
                                    <div className="gfa-media__counter">
                                      <CommentIcon />
                                      {item.comments}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className={`gfa-arrow-button gfa-arrow-button__haze gfa-arrow-left${
                    canScrollPrev ? ' gfa-arrow-button--visible' : ''
                  }`}
                  onClick={() => scrollCarousel(-1)}
                  disabled={!canScrollPrev}
                  aria-label="Previous Instagram posts"
                >
                  <ArrowIcon flipped />
                </button>
                <button
                  type="button"
                  className={`gfa-arrow-button gfa-arrow-button__haze gfa-arrow-right${
                    canScrollNext ? ' gfa-arrow-button--visible' : ''
                  }`}
                  onClick={() => scrollCarousel(1)}
                  disabled={!canScrollNext}
                  aria-label="Next Instagram posts"
                >
                  <ArrowIcon />
                </button>
              </div>

              <div className="gfa-content__button-container button-oAWOBOllLYUW">
                <a
                  href={INSTAGRAM_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gfa-content__button button-oAWOBOllLYUW"
                >
                  Visit Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrowIcon({flipped = false}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={flipped ? {transform: 'scaleX(-1)'} : undefined}
    >
      <path
        d="M7.5 4.16797L14.1667 10.0013L7.5 15.8346"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ReelIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <path
        fill="#FFFFFF"
        fillRule="evenodd"
        d="M2 7.25h3.614L9.364 2H6a4 4 0 0 0-4 4v1.25Zm20 0h-6.543l3.641-5.097A4.002 4.002 0 0 1 22 6v1.25ZM2 8.75h20V18a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8.75Zm5.457-1.5L11.207 2h6.157l-3.75 5.25H7.457Zm7.404 7.953a.483.483 0 0 0 0-.837l-3.985-2.3a.483.483 0 0 0-.725.418v4.601c0 .372.403.605.725.419l3.985-2.301Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function InstagramPlayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <path
        fill="#ffffff"
        fillRule="evenodd"
        d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Zm4.803-11.305a.8.8 0 0 0 0-1.386l-6.6-3.81a.8.8 0 0 0-1.2.693v7.62a.8.8 0 0 0 1.2.694l6.6-3.81Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <path
        fill="#FFFFFF"
        fillRule="evenodd"
        d="M19.683 5.386c-1.717-1.848-4.468-1.848-6.185 0L12 6.998l-1.498-1.612c-1.717-1.848-4.468-1.848-6.185 0-1.75 1.884-1.756 4.962-.019 6.854L12 19.615l7.702-7.375c1.737-1.892 1.73-4.97-.02-6.854Zm-7.65-1.361c2.508-2.7 6.607-2.7 9.115 0 2.47 2.658 2.47 6.939 0 9.597l-.02.021-8.09 7.748a1.5 1.5 0 0 1-2.075 0l-8.091-7.748-.02-.021c-2.47-2.658-2.47-6.94 0-9.597 2.508-2.7 6.607-2.7 9.116 0L12 4.06l.032-.035Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path
        fill="#FFFFFF"
        fillRule="evenodd"
        d="M11.903 3.994c-4.375 0-7.922 3.57-7.922 7.974s3.547 7.974 7.922 7.974a7.843 7.843 0 0 0 4.15-1.18l.387-.24 3.092.995-1.003-3.154.223-.383a7.972 7.972 0 0 0 1.074-4.012c0-4.404-3.547-7.974-7.923-7.974ZM2 11.968C2 6.463 6.434 2 11.903 2c5.47 0 9.904 4.463 9.904 9.968a9.982 9.982 0 0 1-1.126 4.62l1.265 3.98c.27.848-.525 1.65-1.369 1.378l-3.887-1.25a9.813 9.813 0 0 1-4.787 1.24C6.433 21.936 2 17.473 2 11.968Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
