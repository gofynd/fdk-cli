import * as BannerImageSection from './banner-image.section.jsx';
import * as BestCollectionSectionSection from './best-collection-section.jsx';
import * as LinkSection from './link.section.jsx';
import * as RawHtmlSection from './raw-html.section.jsx';
import * as SectionBannerSection from './section-banner.section.jsx';
import * as SwipeGallerySection from './swipe-gallery.section.jsx';

export default {
            'banner-image': { ...BannerImageSection, },
            'best-collection-section': { ...BestCollectionSectionSection, },
            'link': { ...LinkSection, },
            'raw-html': { ...RawHtmlSection, },
            'section-banner': { ...SectionBannerSection, },
            'swipe-gallery': { ...SwipeGallerySection, },
        }