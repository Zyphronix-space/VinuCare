import ServicesHero from './ServicesHero';
import ExtraBanners from '../../components/ExtraBanners';
import ServiceCard from './ServiceCard';
import ServiceDetail from './ServiceDetail';
import servicesData from './servicesData';
import { categoryColors } from './ServiceMeta';
import Reveal from '../../components/Reveal';
import '../../styles/services.css';

function Service({ onBook, onNavigate, selectedServiceId }) {
  // selectedServiceId comes from the URL (e.g. /services/3) as a string,
  // servicesData ids are numbers — compare loosely.
  const activeService = selectedServiceId
    ? servicesData.find((s) => String(s.id) === String(selectedServiceId))
    : null;

  // If a service id is selected but doesn't match anything, just fall back
  // to the grid instead of showing a blank page.
  if (selectedServiceId && activeService) {
    return (
      <div id="page-services" className="page active">
        <ServiceDetail
          service={activeService}
          accent={categoryColors[activeService.category] || '#374151'}
          onBack={() => onNavigate('services')}
          onBookClick={() => onBook(activeService.title)}
        />
      </div>
    );
  }

  return (
    <div id="page-services" className="page active">
      {/* Hero Section */}
      <ServicesHero />
      <ExtraBanners page="services" />

      <div className="svc-page-wrap">
        {/* Every service gets the same wide banner card, laid out 2-up */}
        <div className="svc-grid">
          {servicesData.map((service, i) => (
            <Reveal key={service.id} delay={(i % 2) * 100}>
              <ServiceCard
                category={service.category}
                title={service.title}
                description={service.description}
                image={service.heroImage || service.image}
                tags={service.tags}
                btnText={service.btnText}
                accent={categoryColors[service.category] || '#374151'}
                onBookClick={() => onBook(service.title)}
                onCardClick={() => onNavigate && onNavigate('services', service.id)}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Service;