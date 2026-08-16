import checkupsWellnessExam from '../../assets/images/services/checkups-wellness-exam.jpg';
import checkupsInjection from '../../assets/images/services/checkups-injection.jpg';
import checkupsXray from '../../assets/images/services/checkups-xray.avif';
import checkupsWellnessHighlight from '../../assets/images/services/checkups-wellness-highlight.jpg';
import checkupsVaccinationsHighlight from '../../assets/images/services/checkups-vaccinations-highlight.jpg';
import checkupsDiagnosticsHighlight from '../../assets/images/services/checkups-diagnostics-highlight.jpg';

import groomingHaircut from '../../assets/images/services/grooming-haircut.webp';
import groomingBath from '../../assets/images/services/grooming-bath.webp';
import groomingNailTrim from '../../assets/images/services/grooming-nail-trim.jpg';
import groomingFullGroomHighlight from '../../assets/images/services/grooming-fullgroom-highlight.jpg';
import groomingBathTidyHighlight from '../../assets/images/services/grooming-bathtidy-highlight.jpg';
import groomingAddOnHighlight from '../../assets/images/services/grooming-addon-highlight.jpg';

import emergencyRoom from '../../assets/images/services/emergency-room.jpg';
import emergencyIcu from '../../assets/images/services/emergency-icu.jpg';
import emergencySurgery from '../../assets/images/services/emergency-surgery.jpg';
import emergencyUrgentHighlight from '../../assets/images/services/emergency-urgent-highlight.jpg';
import emergencyIcuHighlight from '../../assets/images/services/emergency-icu-highlight.jpg';
import emergencySurgicalHighlight from '../../assets/images/services/emergency-surgical-highlight.jpg';

import boardingKennel from '../../assets/images/services/boarding-kennel.jpg';
import boardingDaycare from '../../assets/images/services/boarding-daycare.jpg';
import boardingCozyRoom from '../../assets/images/services/boarding-cozy-room.jpg';
import boardingOvernightHighlight from '../../assets/images/services/boarding-overnight-highlight.jpg';
import boardingDaycareHighlight from '../../assets/images/services/boarding-daycare-highlight.jpg';
import boardingExtraCareHighlight from '../../assets/images/services/boarding-extracare-highlight.jpg';
import boardingWhatToBringHighlight from '../../assets/images/services/boarding-whattobing-highlight.jpg';

import trainingPuppyClass from '../../assets/images/services/training-puppy-class.jpg';
import trainingObedience from '../../assets/images/services/training-obedience.webp';
import trainingBehaviour from '../../assets/images/services/training-behaviour.jpg';
import trainingPuppyHighlight from '../../assets/images/services/training-puppy-highlight.jpg';
import trainingObedienceHighlight from '../../assets/images/services/training-obedience-highlight.jpg';
import trainingBehaviourHighlight from '../../assets/images/services/training-behaviour-highlight.jpg';

import spaAromatherapy from '../../assets/images/services/spa-aromatherapy.jpg';
import spaMassage from '../../assets/images/services/spa-massage.jpg';
import spaPawCare from '../../assets/images/services/spa-paw-care.webp';
import spaAromatherapyHighlight from '../../assets/images/services/spa-aromatherapy-highlight.jpg';
import spaMassageHighlight from '../../assets/images/services/spa-massage-highlight.jpg';
import spaPawCareHighlight from '../../assets/images/services/spa-pawcare-highlight.jpg';

import nutritionConsultation from '../../assets/images/services/nutrition-consultation.jpg';
import nutritionWeightCheck from '../../assets/images/services/nutrition-weight-check.jpg';
import nutritionDietAssessment from '../../assets/images/services/nutrition-diet-assessment.jpg';
import nutritionDietHighlight from '../../assets/images/services/nutrition-diet-highlight.jpg';
import nutritionWeightHighlight from '../../assets/images/services/nutrition-weight-highlight.jpg';
import nutritionSpecialHighlight from '../../assets/images/services/nutrition-special-highlight.jpg';

import dentalCleaning from '../../assets/images/services/dental-cleaning.webp';
import dentalTeethExam from '../../assets/images/services/dental-teeth-exam.webp';
import dentalScalingHighlight from '../../assets/images/services/dental-scaling-highlight.jpg';
import dentalOralHighlight from '../../assets/images/services/dental-oral-highlight.jpg';
import dentalHomecareHighlight from '../../assets/images/services/dental-homecare-highlight.jpg';
import dentalScaling from '../../assets/images/services/dental-scaling.jpg';

const servicesData = [
  {
    id: 1,
    category: "Veterinary",
    title: "Veterinary Check-ups",
    description: "Thorough wellness exams, vaccination schedules, blood work, X-ray and preventive care tailored to your pet's age and breed.",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=70",
    heroImage: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1400&auto=format&fit=crop&q=70",
    tags: ["Wellness Exam", "Vaccinations", "Blood Panel", "X-Ray"],
    btnText: "Book Now",
    tagline: "Preventive care that keeps tails wagging for years",
    intro: "Regular wellness visits are the foundation of a long, healthy life. Our vets look beyond the obvious, catching small issues early and building a health plan around your pet's exact age, breed and lifestyle — not a one-size-fits-all checklist.",
    highlights: [
      {
        title: "Wellness Exam",
        image: checkupsWellnessHighlight,
        points: ["Nose-to-tail physical exam", "Weight & body condition check", "Vitals and temperature check", "Personalised health plan"]
      },
      {
        title: "Vaccinations",
        image: checkupsVaccinationsHighlight,
        points: ["Core & non-core vaccine schedules", "Titre testing on request", "Digital vaccination records", "Automatic booster reminders"]
      },
      {
        title: "Diagnostics",
        image: checkupsDiagnosticsHighlight,
        position: "top",
        points: ["In-house blood panels", "Digital X-ray imaging", "Same-day results in most cases", "Referral for specialist imaging"]
      }
    ],
    gallery: [
      { src: checkupsWellnessExam, alt: "Vet performing a wellness exam on a dog" },
      { src: checkupsInjection, alt: "Veterinarian giving an injection" },
      { src: checkupsXray, alt: "Veterinary X-ray of a dog" }
    ],
    info: "New patients should bring any previous medical records or vaccination history so we can build an accurate health profile from day one."
  },
  {
    id: 2,
    category: "Grooming",
    title: "Grooming & Styling",
    description: "Professional bathing, breed-specific haircuts, nail filing, ear cleaning and teeth brushing by certified groomers.",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop&q=70",
    heroImage: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1400&auto=format&fit=crop&q=70",
    tags: ["Bath & Dry", "Haircut", "Nail Trim", "Ear Clean"],
    btnText: "Book Now",
    tagline: "Spa-quality grooming for every coat type",
    intro: "From a quick tidy-up to a full breed-standard cut, our groomers take the time to work with your pet's temperament, not against it — so grooming day stays a calm, positive experience.",
    highlights: [
      {
        title: "Full Groom",
        image: groomingFullGroomHighlight,
        position: "bottom",
        points: ["Shampoo & conditioning bath", "Breed-specific haircut", "Blow-dry and brush-out", "Complimentary bandana"]
      },
      {
        title: "Bath & Tidy",
        image: groomingBathTidyHighlight,
        points: ["De-shedding bath", "Nail trim & ear clean", "Paw pad trim", "Light finishing touch-up"]
      },
      {
        title: "Add-On Treatments",
        image: groomingAddOnHighlight,
        position: "top",
        points: ["Teeth brushing", "Flea & tick bath", "De-shedding treatment", "Paw balm application"]
      }
    ],
    gallery: [
      { src: groomingHaircut, alt: "Groomer giving a dog a haircut" },
      { src: groomingBath, alt: "Dog getting a bath at the grooming salon" },
      { src: groomingNailTrim, alt: "Groomer trimming a dog's nails" }
    ],
    info: "We recommend a grooming visit every 4–6 weeks to keep coats, nails and ears in top condition between appointments."
  },
  {
    id: 3,
    category: "Emergency",
    title: "Emergency & Critical Care",
    description: "24/7 urgent consultations with a fully equipped ICU, surgery suite and experienced emergency care team.",
    image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=70",
    heroImage: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1400&auto=format&fit=crop&q=70",
    tags: ["24/7 Urgent", "ICU", "Surgery", "Critical Care"],
    btnText: "Call Now",
    tagline: "24/7 support when every minute matters",
    intro: "When something goes wrong, you shouldn't have to wait. Our emergency team is on call around the clock, equipped to triage, stabilise and treat critical cases the moment your pet arrives.",
    highlights: [
      {
        title: "Urgent Consultations",
        image: emergencyUrgentHighlight,
        points: ["Round-the-clock on-call vet", "Rapid triage on arrival", "Pain management protocols", "Stabilisation before transfer"]
      },
      {
        title: "ICU & Monitoring",
        image: emergencyIcuHighlight,
        points: ["Continuous vital monitoring", "Oxygen therapy support", "IV fluid therapy", "Overnight observation"]
      },
      {
        title: "Surgical Response",
        image: emergencySurgicalHighlight,
        points: ["On-site surgical suite", "Emergency soft-tissue surgery", "Post-op recovery care", "Owner updates throughout"]
      }
    ],
    gallery: [
      { src: emergencyRoom, alt: "Veterinary emergency room" },
      { src: emergencyIcu, alt: "Animal ICU monitoring equipment" },
      { src: emergencySurgery, alt: "Veterinary emergency surgery in progress" }
    ],
    info: "If your pet is in distress, call ahead so our team can prepare the right equipment and staff before you arrive."
  },
  {
    id: 4,
    category: "Boarding",
    title: "Boarding & Daycare",
    description: "Comfortable individual kennels, daily enrichment, supervised play groups and nightly check-ins.",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=70",
    heroImage: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1400&auto=format&fit=crop&q=70",
    tags: ["Overnight Stay", "Daycare", "Webcam Access"],
    btnText: "Book Now",
    tagline: "A home away from home for your pet",
    intro: "Whether it's a single day of play or a two-week stay, our boarding suites and daycare groups are built around routine, comfort and enough enrichment to keep tails wagging until you're back.",
    highlights: [
      {
        title: "Overnight Stay",
        image: boardingOvernightHighlight,
        points: ["Private climate-controlled kennels", "Fresh bedding & bowls provided", "Twice-daily feeding", "Nightly welfare checks"]
      },
      {
        title: "Daycare",
        image: boardingDaycareHighlight,
        points: ["Supervised play groups", "Indoor & outdoor play areas", "Rest periods between sessions", "Webcam access for peace of mind"]
      },
      {
        title: "Extra Care",
        image: boardingExtraCareHighlight,
        points: ["Medication administration", "Special diet accommodation", "One-on-one cuddle time", "Daily photo updates"]
      },
      {
        title: "What to Bring",
        image: boardingWhatToBringHighlight,
        position: "top",
        points: [
          "Pet must arrive in a secure carrier or cage for check-in",
          "Own food if on a special diet (we provide standard meals otherwise)",
          "A favourite blanket, bed or toy to help them settle in",
          "Leash and collar/harness with ID tag"
        ]
      }
    ],
    gallery: [
      { src: boardingKennel, alt: "Dog boarding kennel facility" },
      { src: boardingDaycare, alt: "Dogs playing together in daycare" },
      { src: boardingCozyRoom, alt: "Cozy pet boarding room" }
    ],
    info: "All boarders must be up to date on core vaccinations at least 48 hours before check-in. Please bring your pet in a secure carrier or cage for drop-off and collection — this keeps them (and other boarders) calm and safe in our reception area. Cats and small pets should stay in their carrier until a staff member walks them to their kennel; dogs should be kept on a leash. If your pet takes medication, bring it in its original, clearly labelled packaging with dosage instructions."
  },
  {
    id: 5,
    category: "Training",
    title: "Training & Behaviour",
    description: "Certified trainers using proven positive reinforcement. Puppy classes, obedience training and behavioural consultations.",
    image: "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=600&auto=format&fit=crop&q=70",
    heroImage: "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=1400&auto=format&fit=crop&q=70",
    tags: ["Puppy Class", "Obedience", "Socialisation"],
    btnText: "Book Now",
    tagline: "Positive-reinforcement training for every stage of life",
    intro: "Good training builds trust in both directions. Our trainers use reward-based, force-free methods to help puppies build confidence and adult dogs work through real-world behaviour challenges.",
    highlights: [
      {
        title: "Puppy Classes",
        image: trainingPuppyHighlight,
        points: ["Basic obedience cues", "Leash & crate introduction", "Early socialisation", "House-training guidance"]
      },
      {
        title: "Obedience Training",
        image: trainingObedienceHighlight,
        points: ["Sit / stay / recall mastery", "Loose-leash walking", "Distraction-proofing", "Group & private sessions"]
      },
      {
        title: "Behaviour Consults",
        image: trainingBehaviourHighlight,
        points: ["Anxiety & reactivity support", "Resource-guarding guidance", "Tailored home exercises", "Follow-up progress check-ins"]
      }
    ],
    gallery: [
      { src: trainingPuppyClass, alt: "Puppy training class" },
      { src: trainingObedience, alt: "Dog obedience training with a leash" },
      { src: trainingBehaviour, alt: "Dog trainer leading a behaviour session" }
    ],
    info: "Sessions are reward-based and force-free, and every plan comes with take-home exercises to practise between visits."
  },
  {
    id: 6,
    category: "Spa",
    title: "Spa & Wellness",
    description: "Aromatherapy baths, deep-conditioning treatments, therapeutic massage, blueberry facials and paw care.",
    image: "https://images.unsplash.com/photo-1520038410233-7141be7e6f97?w=600&auto=format&fit=crop&q=70",
    heroImage: "https://images.unsplash.com/photo-1520038410233-7141be7e6f97?w=1400&auto=format&fit=crop&q=70",
    tags: ["Aromatherapy", "Massage", "Paw Treatment"],
    btnText: "Book Now",
    tagline: "Relaxing treatments that pamper from nose to tail",
    intro: "Part spa day, part wellness check — our calming treatments are designed to soothe anxious pets, support senior joints, and give every coat a healthy, well-loved shine.",
    highlights: [
      {
        title: "Aromatherapy Bath",
        image: spaAromatherapyHighlight,
        points: ["Calming lavender or oatmeal soak", "Warm towel wrap", "Gentle massage", "Soothing coat rinse"]
      },
      {
        title: "Therapeutic Massage",
        image: spaMassageHighlight,
        position: "top",
        points: ["Muscle relaxation techniques", "Joint mobility support", "Stress-relief for senior pets", "Post-groom cooldown"]
      },
      {
        title: "Paw & Skin Care",
        image: spaPawCareHighlight,
        position: "top",
        points: ["Paw pad conditioning treatment", "Blueberry facial", "Moisturising balm application", "Sensitive-skin friendly products"]
      }
    ],
    gallery: [
      { src: spaAromatherapy, alt: "Dog getting an aromatherapy spa bath" },
      { src: spaMassage, alt: "Pet massage therapy" },
      { src: spaPawCare, alt: "Dog paw care treatment" }
    ],
    info: "A great option for senior pets, post-surgery recovery, or simply a well-deserved treat day."
  },
  {
    id: 7,
    category: "Nutrition",
    title: "Nutrition & Dietary Care",
    description: "Personalised dietary plans from certified animal nutritionists — weight management, allergy diets and supplement advice.",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=70",
    heroImage: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1400&auto=format&fit=crop&q=70",
    tags: ["Diet Plans", "Allergy Diet", "Supplements"],
    btnText: "Book Now",
    tagline: "Science-based diets tailored to your pet's needs",
    intro: "Nutrition affects everything from coat condition to energy levels and long-term health. Our consultations turn confusing food labels and conflicting advice into a clear, practical plan.",
    highlights: [
      {
        title: "Diet Assessment",
        image: nutritionDietHighlight,
        points: ["Body condition scoring", "Current diet review", "Life-stage nutrition planning", "Follow-up weigh-ins"]
      },
      {
        title: "Weight Management",
        image: nutritionWeightHighlight,
        points: ["Calorie-controlled meal plans", "Portion guidance", "Progress tracking", "Gradual transition schedules"]
      },
      {
        title: "Special Diets",
        image: nutritionSpecialHighlight,
        position: "top",
        points: ["Food allergy elimination trials", "Prescription diet guidance", "Supplement recommendations", "Home-cooking consultations"]
      }
    ],
    gallery: [
      { src: nutritionConsultation, alt: "Vet nutrition consultation" },
      { src: nutritionWeightCheck, alt: "Dog weight check on a scale" },
      { src: nutritionDietAssessment, alt: "Pet food diet assessment" }
    ],
    info: "Bring a list of current foods, treats and supplements to your first nutrition consult for the most accurate plan."
  },
  {
    id: 8,
    category: "Dental",
    title: "Dental Health",
    description: "Professional dental scaling, polishing, oral health assessments and home care guidance for fresh, healthy teeth.",
    image: "https://images.unsplash.com/photo-1606425271394-c3ca9aa1fc06?w=600&auto=format&fit=crop&q=70",
    heroImage: "https://images.unsplash.com/photo-1606425271394-c3ca9aa1fc06?w=1400&auto=format&fit=crop&q=70",
    tags: ["Scaling", "Polishing", "Oral Assessment"],
    btnText: "Book Now",
    tagline: "Keeping smiles healthy, one clean at a time",
    intro: "Dental disease is one of the most common — and most overlooked — health issues in pets. Regular cleanings and early assessments prevent pain, tooth loss, and problems that can affect the whole body.",
    highlights: [
      {
        title: "Dental Scaling",
        image: dentalScalingHighlight,
        position: "top",
        points: ["Ultrasonic tartar removal", "Subgingival cleaning", "Polishing for a smooth finish", "Fluoride treatment"]
      },
      {
        title: "Oral Assessment",
        image: dentalOralHighlight,
        points: ["Full mouth examination", "Dental X-rays when needed", "Early disease detection", "Treatment plan discussion"]
      },
      {
        title: "Home Care Guidance",
        image: dentalHomecareHighlight,
        position: "top",
        points: ["Brushing technique demonstration", "Dental chew recommendations", "Diet tips for oral health", "Follow-up check schedule"]
      }
    ],
    gallery: [
      { src: dentalCleaning, alt: "Veterinary dental cleaning" },
      { src: dentalTeethExam, alt: "Dog teeth exam by a vet" },
      { src: dentalScaling, alt: "Pet dental scaling procedure" }
    ],
    info: "Most pets benefit from a professional dental clean once a year — more often for small and senior breeds."
  }
];

export default servicesData;