import * as LinkSection from './link.section.js';
import * as RawHtmlSection from './raw-html.section.js';
import * as SectionBannerSection from './section-banner.section.js';
import * as SwipeGallerySection from './swipe-gallery.section.js';

export default {
            'link': { ...LinkSection, },
                'raw-html': { ...RawHtmlSection, },
                'section-banner': { ...SectionBannerSection, },
                'swipe-gallery': { ...SwipeGallerySection, },
        }