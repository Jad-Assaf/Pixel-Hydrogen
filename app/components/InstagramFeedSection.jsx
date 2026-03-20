import {useEffect, useRef, useState} from 'react';

const INSTAGRAM_PROFILE_URL = 'https://instagram.com/pixel.zones';

const INSTAGRAM_FEED_ITEMS = [
  {
    id: '17863656009595892',
    video:
      'https://scontent-iad3-2.cdninstagram.com/o1/v/t16/f2/m69/AQPKCNJnDhd1mlB8AyISjPwI1ZidlH7Lbr5N79BkvQ_c7CSJBTN1yKGM23iOvqc1Z2g45kR_yqmgVFE99XYxSHMD.mp4?strext=1&_nc_cat=103&_nc_sid=5e9851&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_ohc=JsNUMfjznJEQ7kNvwEqdxj_&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NjM2NTYwMDk1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjoyNiwidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjk5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=9a54c30c8ecd7acd&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HQWdNSGliREpiNHNEdTRGQUVfVU1nUVZGZDRxYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzUwNEI2NDQ4OTBGNjBDM0IxNDlGRjAyMTAyNDg2OEE3X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbo77vt0Lm7PxUCKAJDMywXQFj5BiTdLxsYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQEPMZHAcgGCnOo5uSVfbY2JAFZKsddsSDyCTT-jPrPG1IJWnL4k8XX1mYFK6aIwjNaZBU4ujaUH&oh=00_Afyyf0KYOmdfDDs1KIFs7Qx2RDa8kSrzXufmRnqGI7uwEQ&oe=69C27BA9',
    poster:
      'https://scontent-iad3-1.cdninstagram.com/v/t51.82787-15/640954076_18039335126754206_4313065391517093544_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=110&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=givOYeLv2TEQ7kNvwFGPtRT&_nc_oc=AdrONoPNk7P27vr0OprRyoo-ClnA-_hazAJcXuam0cVgWu5NbdAQsCf6-l-p1n-sSoo&_nc_zt=23&_nc_ht=scontent-iad3-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&_nc_tpa=Q5bMBQFC3NpHVEVW6cDIUXmC749Zx8i8yEnYhQ2saTSQPfJjIjroJLmkKRySjKA0LEu5NFwi--QUFqRn&oh=00_Afwy8WsnLO0IgcRIU1my4D_5ACVZWT6l16TjAM-oqSXYxg&oe=69C273F2',
  },
  {
    id: '17863043208595892',
    video:
      'https://scontent-iad3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNpT9dw7nF6YRm5n9kPifMXJJm8Gku7pQoXuKefB1PZFunokQUvPBmDaca3VYZ0Trte_O0cEAgzHW8re3nRZ6b3.mp4?strext=1&_nc_cat=102&_nc_sid=5e9851&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_ohc=FrJ-Al81aLEQ7kNvwH1lHVe&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NjMwNDMyMDg1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjozMCwidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjY3LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=dc61b8f4dbbd7b0f&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HQlFjOHlWcnNWM19oMWdEQUpyLWtYdE5vamNQYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzlBNDcyQ0QzQzcxNDE5NDkzQjI3MDI0NjMxOEYwODhGX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbopvKQ-5W7PxUCKAJDMywXQFDO6XjU_fQYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQEPNWTzU6VAW1U9LsdEN93-nPaD7jfkdtjFb520X036c6COwbwmdDMMNd-jNq3k2gyuztnOVLrE&oh=00_AfxaI328HN7h2UrRRp_V70u-w-kecPRq0fijuZrEJFekqg&oe=69C26622',
    poster:
      'https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/631892711_18038856410754206_3514005443106549030_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=111&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=OT-gUtJsyAMQ7kNvwFtRPJy&_nc_oc=AdrzdM4xl8gznE7lC9K4SDA9uu0gwda1gMpx3I-XQaIR1yznZv0EsMflHTVcxGOTaJ0&_nc_zt=23&_nc_ht=scontent-iad3-2.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&_nc_tpa=Q5bMBQGS18xF1BnrvqMAFcPi1ts-VIyd9lnVoPh3pztpUkPOBchPRxzDV9ylaKU-7GnoclhtGs9cetcc&oh=00_AfwI73I1_COEZ-vURRPd7IwvTGSQ3ho2sflPsi1hBZKsIw&oe=69C26D91',
  },
  {
    id: '17862587283595892',
    video:
      'https://scontent-iad3-1.cdninstagram.com/o1/v/t16/f2/m69/AQO0juP7E3ZSFoRiyYqQqB19Wkcg9yjC_4-LJ0yiy3NvqEyBiCKz80OTYvfkAqUIJMpkGoY9LoT-nopSh-DTlJ8N.mp4?strext=1&_nc_cat=107&_nc_sid=5e9851&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_ohc=pSwmXAjR810Q7kNvwGvHBh2&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NjI1ODcyODM1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjozMywidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjExLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=31205127fb357ff6&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HRGVpWlNWVUYzRmFxdWtMQUUyZ2Z1d080MEVGYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyL0ZBNDRFMTAyRDE5OEZBNzc2M0Y3MTE1RkE3QzAxQTk5X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACboifectvu6PxUCKAJDMywXQCewo9cKPXEYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQHlzSdRODx7Pgt4lWGtXXa8uQS06dTvT7JXpTNl3jMFQNsHnXinSsKlXHved0DktNnjXt_EU5xf&oh=00_Afwv5cC8oJt90WLYsbc9uyy0KA0-QTy9ejLCX3Qkz4UejQ&oe=69C2740D',
    poster:
      'https://scontent-iad3-1.cdninstagram.com/v/t51.71878-15/628079389_887352410721279_7839436118117884873_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=102&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=hr_-CU5C6DcQ7kNvwEgJhSP&_nc_oc=Adot09M0yuWD1vuTinpKBGjNw4cEjkItr8ch0qFowc_T3sxn1kZcbpkOq3yawhSKv0A&_nc_zt=23&_nc_ht=scontent-iad3-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&_nc_tpa=Q5bMBQFq43AZN17kL8X6Y1CmXGH6qXqvgvvfJOiMqipCYWhGn9Ph_BKFflo6yE4JP7wKXXA-fANa5P6Y&oh=00_AfwV6qzlll4HwUXkTfwFOifDMTvpsF4YLcdN0Bj4PdJYfw&oe=69C25A4D',
  },
  {
    id: '17861968182595892',
    video:
      'https://scontent-iad3-2.cdninstagram.com/o1/v/t16/f2/m69/AQMHUvfHsDHN-DqChNUcn5ZLAWq1w80Q-WJlzCCalJpuoNzmgC2o9qXmJRHFdDFOyBQj-WuogC_dJevDuLJx1Na4.mp4?strext=1&_nc_cat=106&_nc_sid=5e9851&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_ohc=eCVRuoAVCYoQ7kNvwG_6QSn&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NjE5NjgxODI1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjozNywidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjQ5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=432857ef79aef48c&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HQU5XbWlYbUZkaHBiLXNDQUxUSkpQNUJYVEFBYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyL0NBNDI5OThENDlFRDY4ODBENjE0OUEwMzlBQjA1NTgxX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACboxJrIsde6PxUCKAJDMywXQEiGJN0vGqAYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQFdYjfUPDcY9NYSnCrPk0KKJuL9hKvMsLSjcRicrkccoXX8l1rYBqf_i-pkTvOqVDN5LacSblyE&oh=00_Afx_S2XWeQ9-QfWZVstC-CGNxSul4iCghu3_4jqnL6rJng&oe=69C27CEE',
    poster:
      'https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/631744586_18038087774754206_1046467975625761204_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=103&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=80AeefYRYXcQ7kNvwGNc9e8&_nc_oc=AdoBJNntYpLwF9XLAZVP-xgLRTrsp0BG72sa7QknkzRLRH-czK6Wzr9bQPyqV96uSUU&_nc_zt=23&_nc_ht=scontent-iad3-2.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&_nc_tpa=Q5bMBQHAaIXFKv0N6Wf4gSvF9ckPgTlFQ1sKrr2dog0q2TrgYmcBblBbcvF6ye4zjgHUF86iqGEPi_o6&oh=00_Afz9DWxUJBr6Loin_dPS_0OuCjn_-s5g3r-MpWQFS5f7gg&oe=69C28E8C',
  },
  {
    id: '17861554335595892',
    video:
      'https://scontent-iad3-1.cdninstagram.com/o1/v/t16/f2/m69/AQNrfTFacHGtd-vKYegUgm87Q331lPon_Q0Pic85LT52NyRs9Qru-zMAXtaEgohtATZIK6k97nBQP1ETyzrMCadd.mp4?strext=1&_nc_cat=110&_nc_sid=5e9851&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_ohc=Q0DjlrFnoGYQ7kNvwHE6ZHy&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NjE1NTQzMzU1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjo0MCwidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjEyMiwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&ccb=17-1&vs=5553493118d36c65&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HTV9nV3lYTUNqbnM0WnNGQU1BaVFBelJnNjFNYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyL0RDNDZCRjQ5QTVCN0I0OEUyQkUxQ0M0Q0EwODUzQjgwX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbo9fmUpr-6PxUCKAJDMywXQF69T987ZFoYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQEE83-nNC5i5eUDStjc_aKYvBEN80yugAxx2Y1eJ8haT9fbrltr2ChgfsbSTL9OTni44cKh3l50&oh=00_AfwVIt_MMf8yOxqWhB3aiP8jyGWusse5zLo6PgeWJc_BZQ&oe=69C2851E',
    poster:
      'https://scontent-iad3-1.cdninstagram.com/v/t51.82787-15/631086259_18037792721754206_2991813609133160428_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=101&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=3Wx6AvqirfIQ7kNvwGBER5Z&_nc_oc=AdqU2x60vJ_GtByM47UzdX3xxKoxedaV2GUa0jbfuTkf9rJyeHZSHmxdWG-1geEHK1c&_nc_zt=23&_nc_ht=scontent-iad3-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&_nc_tpa=Q5bMBQHnHRkyj1DC53zQ807DOlK1o7nyLvSq3Xv5qmAUTfdmwSPmS8p-MRnKuT-bg5GNQ1ylg9U9t2l_&oh=00_AfxgkcBCZ91w682lnq_GNUPBXdvLhnt19_S8IZOP33NE_w&oe=69C2666E',
  },
  {
    id: '17860082739595892',
    video:
      'https://scontent-iad3-2.cdninstagram.com/o1/v/t2/f2/m86/AQO7nV62-obb8kiW_hmZ7Fb_Fpw2mzPboxKYJ1Gwtin4RsxnzNLPj2qmyy9qq2Zz-83YwW9R2GqIWi1qHtCwjBrj9cjE1UonDukReFc.mp4?_nc_cat=105&_nc_sid=5e9851&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_ohc=5_jtcrXMTS0Q7kNvwEYydHS&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NjAwODI3Mzk1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjo1MCwidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjcxLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=fc3aeee798ab4634&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC9CMjQ0OUI2NUI0MTk0RUYzODMwMTE1NjREOTRBOUVBOV92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzQ2NDA1QURFNzFBQjE1OTVBRTUxMDhGNDc0ODA3M0I4X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACboqdL10em5PxUCKAJDMywXQFHki0OVgQYYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQHVLuY7Y6m8BeifojY9dhl8ej_uy_ethPBtDDBVlK9pEESv_7KlP8BUgUHBR7Cvt5AWfKRERH54&oh=00_AfzdfrRI4UoCcuW3unLWiAk6Go7ApT4zgERVjZOTa9Nyjw&oe=69BE68C6',
    poster:
      'https://scontent-iad3-2.cdninstagram.com/v/t51.82787-15/623676242_18036760541754206_5383936569331954242_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=106&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=ScIuMoPbIkcQ7kNvwGd6XeT&_nc_oc=AdpqpwiMKHbI4xlfCWQXcnegAA9dZPbCVrUXMAhHRTjDesa2c6EMeazxBBCLgFGqhR4&_nc_zt=23&_nc_ht=scontent-iad3-2.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&_nc_tpa=Q5bMBQFuT6yJwzxAqf06ME3MTHyeD22INw0X8SuUiRKadTMH29EEW6MoRi1Vow-J7oup9wuhOkFekhOv&oh=00_AfzDyFuKqtE0fH-TRkXX_uPJ3MNLguq7AaQ3x33IUyCgig&oe=69C277F3',
  },
  {
    id: '17859356601595892',
    video:
      'https://scontent-iad3-1.cdninstagram.com/o1/v/t16/f2/m69/AQPHV3if5vggDrq0k9UXQIxj_AdJboBPrL0B11bnSCBCwKKvWGZBKkMn6SbPhfEVQbeoAOU595T1whcLptO4NX0x.mp4?strext=1&_nc_cat=110&_nc_sid=5e9851&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_ohc=LGX_LbYs7RIQ7kNvwE-HvJU&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc4NTkzNTY2MDE1OTU4OTIsImFzc2V0X2FnZV9kYXlzIjo1NSwidmlfdXNlY2FzZV9pZCI6MTAwOTksImR1cmF0aW9uX3MiOjc4LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=f34c3ae21a6a2d32&_nc_vs=HBksFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HR0tjenlSQXZYWWNrNElGQUJfVEdjLTlkVTFwYnNwVEFRQUYVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzI5NDQ3OTk1NDU3OUIyNEQxRjk1REE5RkRBRDIxNUI4X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbo373ir7-5PxUCKAJDMywXQFO8_fO2RaIYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZeadAQA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQElb7a0dR59Z3I9OuY0NFzpZXjBmTHyMjadqJWvymeYcTT9tAh9Ukh-i4F9QaflQcIsyH6gSE8_&oh=00_AfzLt1p0DsqOKFTlZV5EgfeLV6Ps2C6PXyThQX3NHIAUVA&oe=69C263A2',
    poster:
      'https://scontent-iad3-1.cdninstagram.com/v/t51.82787-15/621765018_18036220475754206_4006842885459001104_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=110&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=N_4_OqaDwaMQ7kNvwGXnotJ&_nc_oc=AdrHhczUAp4vHL6lFHihxOTpquZtyma7gLNZfjPI8yxVD4S6EPf4xNS8ECYVChi6cK0&_nc_zt=23&_nc_ht=scontent-iad3-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&_nc_tpa=Q5bMBQFhbD2Tk7U-3Dsn6_5e7qJ3wLb_5U5Aw71MXoXoOk0sAWohu13CyhPB8BGp7HHyV6o3lUxXDGQf&oh=00_AfxEiUC-ok2ZhFivSIfLoVqnmthrcKZ4YpOgGKeFre9mwg&oe=69C25DF9',
  },
  {
    id: '1380634897135004',
    video:
      'https://scontent-iad3-1.cdninstagram.com/o1/v/t2/f2/m86/AQMXW1vV9_bdn2R4OUu8ABPEUOg625XFpfdezNdlXoIYedbc6IYqJiPY0fICI05ixq-Sk4luUwBIB9JRVBADy5fG08gjVpAOAGH6MH8.mp4?_nc_cat=107&_nc_sid=5e9851&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_ohc=2SlvLlSh4tUQ7kNvwFVBrAR&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTM4MDYzNDg5NzEzNTAwNCwiYXNzZXRfYWdlX2RheXMiOjU3LCJ2aV91c2VjYXNlX2lkIjoxMDgyNywiZHVyYXRpb25fcyI6NzIsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=c676188b07b709a1&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC83NTQ3NkQ1NEQyNTNCQkQ5MDcyMkVEQkY1Q0IyN0RCN192aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyL0I4NDBDNDI5QjY5MjI5QkIyN0EzQkFDQTkzQUI1NTg5X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACa41t3Jw-vzBBUCKAJDMywXQFIKn752yLQYEmRhc2hfYmFzZWxpbmVfMV92MREAdf4HZZapAQA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&edm=ANo9K5cEAAAA&_nc_zt=28&_nc_tpa=Q5bMBQGaPp2Xp2OVA-dWQ-GS_XtyhVHSGpTL1iQQdo2Q8X2Q6FSwKNYBQyeIqP1OON5CNe2nv6sf1Bat&oh=00_AfyVEK6GeZz1pwNtaZhcKHPFhi3xIqvoMhP9ZTAaTdaaYQ&oe=69BE6C60',
    poster:
      'https://scontent-iad3-1.cdninstagram.com/v/t51.82787-15/619889944_18035964194754206_8821736132526546753_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=102&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=UOxHWwxFFOUQ7kNvwFWEL2n&_nc_oc=AdoXq9kB9uTZRKCX2kv9z8Xt23gIcoPdQwjR0Ld2ZsdKIjXCRIEW4qvau1lqfmMwetg&_nc_zt=23&_nc_ht=scontent-iad3-1.cdninstagram.com&edm=ANo9K5cEAAAA&_nc_gid=ShH7gXqoLb9g3ozR36jssw&_nc_tpa=Q5bMBQGTOiy7ZKWVFxfKNb-mbEcCr5R2RkyUABdqXDn1o9HiKYBO1DSb6UMDKxbAx0R6wckrUF36Q5hj&oh=00_Afyc9p2LghbOsGNxFeEJrvy-gmzu7WloMySW7bz6Unladw&oe=69C25DE6',
  },
];

export function InstagramFeedSection() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const sectionRef = useRef(null);
  const videoRefs = useRef([]);
  const totalVideos = INSTAGRAM_FEED_ITEMS.length;

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setIsSectionVisible(Boolean(entry?.isIntersecting));
      },
      {threshold: 0.3},
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const videos = videoRefs.current;
    if (!videos.length) return undefined;

    videos.forEach((video, index) => {
      if (!video || index === activeVideoIndex) return;
      video.pause();
      video.currentTime = 0;
    });

    if (!isSectionVisible) {
      videos.forEach((video) => {
        if (!video) return;
        video.pause();
        video.currentTime = 0;
      });
      return undefined;
    }

    const activeVideo = videos[activeVideoIndex];
    if (!activeVideo) return undefined;

    const startPlayback = () => {
      activeVideo.currentTime = 0;
      const playPromise = activeVideo.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {});
      }
    };

    if (activeVideo.readyState >= 2) {
      startPlayback();
      return undefined;
    }

    activeVideo.addEventListener('loadeddata', startPlayback, {once: true});
    return () => {
      activeVideo.removeEventListener('loadeddata', startPlayback);
    };
  }, [activeVideoIndex, isSectionVisible]);

  const setVideoRef = (index) => (node) => {
    videoRefs.current[index] = node;
  };

  const handleVideoEnded = (index) => {
    if (index !== activeVideoIndex) return;
    setActiveVideoIndex((current) => (current + 1) % totalVideos);
  };

  const handleActivate = (index) => {
    setActiveVideoIndex(index);

    videoRefs.current.forEach((video, currentIndex) => {
      if (!video || currentIndex === index) return;
      video.pause();
      video.currentTime = 0;
    });

    const selectedVideo = videoRefs.current[index];
    if (!selectedVideo) return;

    selectedVideo.currentTime = 0;
    const playPromise = selectedVideo.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }
  };

  return (
    <section className="pz-home-section pz-home-instagram" ref={sectionRef}>
      <div className="pz-shell">
        <div className="pz-instagram-copy">
          <h2>Follow us on Instagram</h2>
          <p>
            Join our community for daily inspiration and a closer look at our
            creations
          </p>
        </div>

        <div className="pz-instagram-track" role="list" aria-label="Instagram feed">
          {INSTAGRAM_FEED_ITEMS.map((item, index) => (
            <InstagramCard
              key={item.id}
              item={item}
              index={index}
              isActive={index === activeVideoIndex}
              setVideoRef={setVideoRef}
              onVideoEnded={handleVideoEnded}
              onActivate={handleActivate}
            />
          ))}
        </div>

        <div className="pz-instagram-cta-wrap">
          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="pz-instagram-cta"
          >
            Visit Instagram
          </a>
        </div>
      </div>
    </section>
  );
}

function InstagramCard({
  item,
  index,
  isActive,
  setVideoRef,
  onVideoEnded,
  onActivate,
}) {
  return (
    <button
      type="button"
      className="pz-instagram-card"
      aria-label={`Play Instagram reel ${index + 1}`}
      role="listitem"
      onClick={() => onActivate(index)}
    >
      <video
        ref={setVideoRef(index)}
        className="pz-instagram-media"
        preload={isActive ? 'auto' : 'metadata'}
        muted
        loop={false}
        playsInline
        poster={item.poster}
        onEnded={() => onVideoEnded(index)}
      >
        <source src={item.video} type="video/mp4" />
      </video>
    </button>
  );
}
