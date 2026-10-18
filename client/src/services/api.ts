const API_BASE = '/api';

export class ApiService {
  private static getToken(): string | null {
    return localStorage.getItem('futurepath_token');
  }

  public static setToken(token: string) {
    localStorage.setItem('futurepath_token', token);
  }

  public static clearToken() {
    localStorage.removeItem('futurepath_token');
    localStorage.removeItem('futurepath_user');
  }

  public static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API error (${response.status})`);
    }

    return data;
  }

  // Auth
  public static async login(credentials: { email: string; password: string }) {
    return this.request<{ success: boolean; token: string; user: any; subscription: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  public static async register(data: any) {
    return this.request<{ success: boolean; token: string; user: any; subscription: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public static async demoLogin(role: string) {
    return this.request<{ success: boolean; token: string; user: any; subscription: any }>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
  }

  public static async getMe() {
    return this.request<{ success: boolean; user: any; subscription: any }>('/auth/me');
  }

  // Student
  public static async getStudentProfile() {
    return this.request<{ success: boolean; profile: any }>('/student/profile');
  }

  public static async updateStudentProfile(data: any) {
    return this.request<{ success: boolean; profile: any; completionScore: number; onboardingCompleted: boolean }>('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public static async getStudentDashboard() {
    return this.request<{ success: boolean; dashboard: any }>('/student/dashboard');
  }

  public static async toggleSaveCareer(careerId: string) {
    return this.request<{ success: boolean; saved: boolean; message: string }>(`/student/save-career/${careerId}`, {
      method: 'POST'
    });
  }

  public static async toggleSaveCollege(collegeId: string) {
    return this.request<{ success: boolean; saved: boolean; message: string }>(`/student/save-college/${collegeId}`, {
      method: 'POST'
    });
  }

  // Assessment
  public static async getQuestions() {
    return this.request<{ success: boolean; count: number; questions: any[] }>('/assessment/questions');
  }

  public static async submitAssessment(responses: Record<string, number>) {
    return this.request<{
      success: boolean;
      attemptId: string;
      dimensionScores: Record<string, number>;
      topStrengths: string[];
      readinessProfile: Record<string, number>;
      topMatches: any[];
    }>('/assessment/submit', {
      method: 'POST',
      body: JSON.stringify({ responses })
    });
  }

  public static async getAssessmentResults() {
    return this.request<{ success: boolean; result: any }>('/assessment/results');
  }

  // Careers & Streams
  public static async getCareers(params?: { search?: string; stream?: string; category?: string; demand?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.stream) query.append('stream', params.stream);
    if (params?.category) query.append('category', params.category);
    if (params?.demand) query.append('demand', params.demand);

    return this.request<{ success: boolean; count: number; careers: any[] }>(`/careers?${query.toString()}`);
  }

  public static async getCareerBySlug(slug: string) {
    return this.request<{ success: boolean; career: any }>(`/careers/${slug}`);
  }

  public static async compareCareers(slugs: string[]) {
    return this.request<{ success: boolean; comparison: any[] }>('/careers/compare', {
      method: 'POST',
      body: JSON.stringify({ slugs })
    });
  }

  public static async getStreamGuide() {
    return this.request<{ success: boolean; streams: any[] }>('/careers/meta/stream-guide');
  }

  // Directories
  public static async getColleges(params?: { search?: string; state?: string; maxFee?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.state) query.append('state', params.state);
    if (params?.maxFee) query.append('maxFee', params.maxFee.toString());

    return this.request<{ success: boolean; count: number; colleges: any[] }>(`/directory/colleges?${query.toString()}`);
  }

  public static async getEntranceExams(params?: { search?: string; stream?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.stream) query.append('stream', params.stream);

    return this.request<{ success: boolean; count: number; exams: any[] }>(`/directory/exams?${query.toString()}`);
  }

  public static async getScholarships(params?: { search?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);

    return this.request<{ success: boolean; count: number; scholarships: any[] }>(`/directory/scholarships?${query.toString()}`);
  }

  // Roadmaps
  public static async getRoadmaps() {
    return this.request<{ success: boolean; roadmaps: any[] }>('/roadmaps');
  }

  public static async generateRoadmap(careerTitle: string, targetYear?: string) {
    return this.request<{ success: boolean; roadmap: any }>('/roadmaps/generate', {
      method: 'POST',
      body: JSON.stringify({ careerTitle, targetYear })
    });
  }

  public static async toggleRoadmapTask(roadmapId: string, milestoneIndex: number, taskIndex: number) {
    return this.request<{ success: boolean; roadmap: any }>(`/roadmaps/${roadmapId}/task`, {
      method: 'PATCH',
      body: JSON.stringify({ milestoneIndex, taskIndex })
    });
  }

  public static async getRoadmapExport(roadmapId: string) {
    return this.request<{ success: boolean; report: any }>(`/roadmaps/${roadmapId}/export`);
  }

  // Billing & Subscriptions
  public static async getPlans() {
    return this.request<{ success: boolean; plans: any[] }>('/billing/plans');
  }

  public static async createOrder(planCode: string) {
    return this.request<{ success: boolean; order: any }>('/billing/create-order', {
      method: 'POST',
      body: JSON.stringify({ planCode })
    });
  }

  public static async verifyPayment(payload: { orderId: string; paymentId: string; signature: string }) {
    return this.request<{ success: boolean; subscription: any; message: string }>('/billing/verify-payment', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public static async getInvoices() {
    return this.request<{ success: boolean; invoices: any[] }>('/billing/invoices');
  }

  // AI Mentor
  public static async sendAIChat(message: string, conversationId?: string) {
    return this.request<{ success: boolean; conversationId: string; messageId: string; reply: string; sources: string[] }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId })
    });
  }

  public static async getAIHistory() {
    return this.request<{ success: boolean; conversationId: string | null; messages: any[] }>('/ai/history');
  }

  // Parent
  public static async getParentOverview() {
    return this.request<{ success: boolean; parentName: string; linkedStudents: any[] }>('/parent/overview');
  }

  public static async linkStudent(studentEmail: string, relationship?: string) {
    return this.request<{ success: boolean; message: string; linkId: string }>('/parent/link-student', {
      method: 'POST',
      body: JSON.stringify({ studentEmail, relationship })
    });
  }

  public static async calculateCost(data: any) {
    return this.request<{ success: boolean; estimate: any }>('/parent/cost-planner', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // School
  public static async getSchoolDashboard() {
    return this.request<{ success: boolean; school: any }>('/school/dashboard');
  }

  public static async getSchoolStudents() {
    return this.request<{ success: boolean; count: number; students: any[] }>('/school/students');
  }

  // Counselors
  public static async getCounselors() {
    return this.request<{ success: boolean; count: number; counselors: any[] }>('/counselors');
  }

  public static async bookCounselor(data: any) {
    return this.request<{ success: boolean; message: string; booking: any }>('/counselors/book', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Admin
  public static async getAdminMetrics() {
    return this.request<{ success: boolean; metrics: any }>('/admin/metrics');
  }

  public static async getAdminUsers() {
    return this.request<{ success: boolean; count: number; users: any[] }>('/admin/users');
  }

  public static async updatePlanPrice(code: string, priceINR: number) {
    return this.request<{ success: boolean; message: string; plan: any }>(`/admin/plans/${code}/price`, {
      method: 'POST',
      body: JSON.stringify({ priceINR })
    });
  }
}
