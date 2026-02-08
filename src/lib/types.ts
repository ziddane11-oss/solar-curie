export type Profile = {
  person: {
    name: string;
    birth: string;
    phone: string;
    email: string;
    address: string;
  };
  education: Array<{
    school: string;
    major: string;
    period: string;
    degree: string;
  }>;
  career: Array<{
    school: string;
    period: string;
    subject: string;
    role: string;
    notes: string;
  }>;
};

export type TemplateRule =
  | {
      type: 'find_replace';
      find: string;
      value_path: string;
    }
  | {
      type: 'bookmark';
      field: string;
      value_path: string;
    };

export type TemplateMap = {
  template_id: string;
  template_name?: string;
  rules: TemplateRule[];
};
