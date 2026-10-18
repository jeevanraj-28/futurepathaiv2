export interface DimensionScoreMap {
  [dimension: string]: number; // 0 to 100
}

export interface StudentProfileData {
  currentClass: string;
  currentSubjects?: string[];
  favouriteSubjects?: string[];
  difficultSubjects?: string[];
  skills?: string[];
  hobbies?: string[];
  budgetRange?: string;
  learningStyle?: string;
  careerExpectations?: string;
}

export interface CareerMatchResult {
  careerId: string;
  title: string;
  category: string;
  stream: string;
  matchScore: number;       // overall composite
  interestScore: number;    // dimension alignment
  strengthScore: number;    // cognitive & practical aptitude
  academicScore: number;    // subject fit
  whyItMatches: string;
  areasToDevelop: string;
  suggestedNextSteps: string[];
}

export class RecommendationEngine {
  /**
   * Calculate multi-dimensional alignment between student profile, assessment results, and career catalog
   */
  public static matchCareers(
    careers: any[],
    dimensionScores: DimensionScoreMap,
    profile: StudentProfileData
  ): CareerMatchResult[] {
    const results: CareerMatchResult[] = [];

    const rawFavSubjects = (profile.favouriteSubjects || []).map(s => s.toLowerCase());
    const favSubjects = new Set<string>();
    for (const sub of rawFavSubjects) {
      favSubjects.add(sub);
      if (sub.includes('science')) {
        favSubjects.add('physics');
        favSubjects.add('chemistry');
        favSubjects.add('biology');
      }
      if (sub.includes('math')) {
        favSubjects.add('mathematics');
        favSubjects.add('calculus');
        favSubjects.add('algebra');
      }
      if (sub.includes('computer') || sub.includes('it') || sub.includes('tech')) {
        favSubjects.add('computer science');
        favSubjects.add('informatics');
        favSubjects.add('programming');
      }
    }
    const favSubjectsArr = Array.from(favSubjects);
    const studentSkills = (profile.skills || []).map(s => s.toLowerCase());

    for (const career of careers) {
      let requiredSubjects: string[] = [];
      let recommendedSkills: string[] = [];
      
      try {
        requiredSubjects = JSON.parse(career.requiredSubjectsJson || '[]').map((s: string) => s.toLowerCase());
      } catch (e) {
        requiredSubjects = [];
      }

      try {
        recommendedSkills = JSON.parse(career.recommendedSkillsJson || '[]').map((s: string) => s.toLowerCase());
      } catch (e) {
        recommendedSkills = [];
      }

      // 1. Aptitude & Strength Score (Numerical, Logical, Scientific, Spatial, Creative)
      let strengthScore = 50;
      switch (career.category) {
        case 'Engineering':
        case 'Computing/AI':
          strengthScore = Math.round(
            ((dimensionScores['Logical Reasoning'] || 65) * 0.4) +
            ((dimensionScores['Numerical Reasoning'] || 60) * 0.35) +
            ((dimensionScores['Scientific Thinking'] || 60) * 0.25)
          );
          break;
        case 'Medical':
        case 'Healthcare':
          strengthScore = Math.round(
            ((dimensionScores['Scientific Thinking'] || 65) * 0.45) +
            ((dimensionScores['Logical Reasoning'] || 60) * 0.3) +
            ((dimensionScores['Social Impact'] || 60) * 0.25)
          );
          break;
        case 'Design':
        case 'Architecture':
          strengthScore = Math.round(
            ((dimensionScores['Spatial Reasoning'] || 65) * 0.4) +
            ((dimensionScores['Creative Thinking'] || 70) * 0.4) +
            ((dimensionScores['Practical Problem Solving'] || 60) * 0.2)
          );
          break;
        case 'Commerce':
        case 'Finance':
          strengthScore = Math.round(
            ((dimensionScores['Numerical Reasoning'] || 65) * 0.45) +
            ((dimensionScores['Logical Reasoning'] || 60) * 0.35) +
            ((dimensionScores['Risk Tolerance'] || 50) * 0.2)
          );
          break;
        case 'Law':
        case 'Humanities':
        case 'Media':
          strengthScore = Math.round(
            ((dimensionScores['Verbal Reasoning'] || 70) * 0.45) +
            ((dimensionScores['Communication'] || 65) * 0.35) +
            ((dimensionScores['Leadership & Teamwork'] || 60) * 0.2)
          );
          break;
        default:
          strengthScore = Math.round(
            ((dimensionScores['Practical Problem Solving'] || 60) * 0.5) +
            ((dimensionScores['Logical Reasoning'] || 60) * 0.5)
          );
      }

      // 2. Interest Score (Subject interests, Work style, Values)
      const subjectOverlap = requiredSubjects.filter(sub => 
        favSubjectsArr.some(fav => fav.includes(sub) || sub.includes(fav))
      ).length;
      const subjectAlignmentFactor = requiredSubjects.length > 0 ? (subjectOverlap / requiredSubjects.length) : 0.7;

      const interestDimScore = Math.round(
        ((dimensionScores['Subject Interests'] || 70) * 0.5) +
        ((dimensionScores['Career Values'] || 65) * 0.5)
      );

      const interestScore = Math.min(100, Math.round(interestDimScore * 0.6 + (subjectAlignmentFactor * 100) * 0.4));

      // 3. Academic & Skill readiness
      const skillOverlap = recommendedSkills.filter(sk => 
        studentSkills.some(st => st.includes(sk) || sk.includes(st))
      ).length;
      const skillFactor = recommendedSkills.length > 0 ? (skillOverlap / recommendedSkills.length) : 0.5;

      const academicScore = Math.min(100, Math.round((subjectAlignmentFactor * 60) + (skillFactor * 40)));

      // 4. Overall Weighted Compatibility
      const matchScore = Math.min(98, Math.max(35, Math.round(
        (interestScore * 0.40) +
        (strengthScore * 0.35) +
        (academicScore * 0.25)
      )));

      // Explainable Narrative
      let whyItMatches = `Shows high alignment with your ${strengthScore > 70 ? 'strong cognitive aptitude' : 'curiosity'} and active interest in analytical problem solving.`;
      if (subjectOverlap > 0) {
        whyItMatches += ` Directly leverages your favourite subject preferences (${favSubjectsArr.slice(0, 2).join(', ')}).`;
      }
      if (career.futureDemand === 'VERY_HIGH') {
        whyItMatches += ` Excellent future outlook with strong market expansion across India.`;
      }

      let areasToDevelop = `Strengthen practical foundations in ${(recommendedSkills.slice(0, 2)).join(', ') || 'domain fundamentals'}.`;
      if (strengthScore < 65) {
        areasToDevelop += ` Focus on targeted exercises in problem-solving and structured reasoning.`;
      }

      const suggestedNextSteps = [
        `Review the syllabus of key entrance exams: ${(JSON.parse(career.entranceExamsJson || '["National Tests"]')).slice(0, 2).join(', ')}`,
        `Explore introductory foundational coursework in ${(recommendedSkills[0] || 'core concepts')}`,
        `Connect with a verified career mentor to discuss curriculum milestones and timeline`
      ];

      results.push({
        careerId: career.id,
        title: career.title,
        category: career.category,
        stream: career.stream,
        matchScore,
        interestScore,
        strengthScore,
        academicScore,
        whyItMatches,
        areasToDevelop,
        suggestedNextSteps
      });
    }

    // Sort descending by matchScore
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
}
