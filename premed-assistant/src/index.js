#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

class PreMedCounselingServer {
  constructor() {
    this.server = new Server(
      {
        name: 'premed-counseling-assistant',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          prompts: {},
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'premed://resources/aamc-guide',
            name: 'AAMC Official Pre-Med Guide',
            description: 'Comprehensive admissions guidance from AAMC',
            mimeType: 'text/markdown',
          },
          {
            uri: 'premed://resources/counseling-playbook',
            name: 'Pre-Med Counseling Playbook',
            description: 'Expert counseling strategies and frameworks',
            mimeType: 'text/plain',
          },
        ],
      };
    });

    // Read specific resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      switch (uri) {
        case 'premed://resources/aamc-guide':
          return {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: `# AAMC Official Pre-Med Guide

## Medical School Admissions Overview

### Academic Requirements
- Strong GPA (typically 3.5+ for competitive schools)
- MCAT scores (typically 510+ for competitive schools)
- Prerequisite courses completed
- Science GPA demonstration

### Experience Requirements
- Clinical experience (volunteering, shadowing)
- Research experience
- Community service
- Leadership experiences

### Application Timeline
- Junior year: MCAT preparation and testing
- Spring junior year: Begin application preparation
- Summer before senior year: Submit primary applications
- Fall senior year: Secondary applications and interviews
- Spring senior year: Final decisions

### School Selection Strategy
- Apply broadly (15-25 schools typical)
- Include safety, target, and reach schools
- Consider in-state vs out-of-state preferences
- Research school mission alignment`,
              },
            ],
          };

        case 'premed://resources/counseling-playbook':
          return {
            contents: [
              {
                uri,
                mimeType: 'text/plain',
                text: `Pre-Med Counseling Playbook

STUDENT ASSESSMENT FRAMEWORK:
1. Academic Profile (GPA, MCAT, coursework)
2. Experience Profile (clinical, research, service)
3. Personal Profile (motivation, fit, story)
4. Logistical Profile (geography, finances, timeline)

SCHOOL SELECTION METHODOLOGY:
- Safety schools: GPA/MCAT above 75th percentile
- Target schools: GPA/MCAT at median
- Reach schools: GPA/MCAT below 25th percentile
- Mission fit assessment
- Geographic preferences
- Financial considerations

INTERVIEW PREPARATION STRATEGIES:
- Practice common questions
- Develop compelling personal narrative
- Research school-specific programs
- Mock interview sessions
- Professional dress and etiquette

GAP YEAR PLANNING:
- Academic improvement (post-bacc, retake MCAT)
- Experience enhancement (research, clinical work)
- Application strengthening
- Financial preparation`,
              },
            ],
          };

        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });

    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: 'school-selection-strategy',
            description: 'Create personalized medical school application list',
            arguments: [
              {
                name: 'gpa',
                description: 'Student GPA',
                required: true,
              },
              {
                name: 'mcat',
                description: 'MCAT score',
                required: true,
              },
              {
                name: 'state',
                description: 'State of residence',
                required: false,
              },
              {
                name: 'preferences',
                description: 'Any specific preferences',
                required: false,
              },
            ],
          },
          {
            name: 'application-timeline',
            description: 'Month-by-month planning for application cycle',
            arguments: [
              {
                name: 'current_year',
                description: 'Current academic year (freshman, sophomore, etc.)',
                required: true,
              },
              {
                name: 'target_cycle',
                description: 'Target application cycle year',
                required: true,
              },
            ],
          },
          {
            name: 'interview-prep',
            description: 'Targeted preparation for different interview formats',
            arguments: [
              {
                name: 'interview_type',
                description: 'Type of interview (traditional, MMI, etc.)',
                required: true,
              },
              {
                name: 'school_name',
                description: 'Name of the school',
                required: false,
              },
            ],
          },
        ],
      };
    });

    // Execute prompts
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'school-selection-strategy':
          const { gpa, mcat, state = 'Unknown', preferences = '' } = args || {};
          return {
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Create a personalized medical school application strategy for a pre-med student with the following profile:

GPA: ${gpa}
MCAT: ${mcat}
State of Residence: ${state}
Preferences: ${preferences}

Please provide:
1. Competitiveness assessment
2. School categories (safety, target, reach)
3. Specific school recommendations
4. Application strategy advice
5. Areas for improvement if needed

Base your recommendations on AAMC data and current admissions trends.`,
                },
              },
            ],
          };

        case 'application-timeline':
          const { current_year, target_cycle } = args || {};
          return {
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Create a detailed month-by-month timeline for a ${current_year} student targeting the ${target_cycle} application cycle.

Include:
1. MCAT preparation and testing timeline
2. Application preparation milestones
3. Experience building opportunities
4. Key deadlines and dates
5. Backup planning considerations

Provide specific actionable steps for each time period.`,
                },
              },
            ],
          };

        case 'interview-prep':
          const { interview_type, school_name = 'medical school' } = args || {};
          return {
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Prepare comprehensive interview guidance for a ${interview_type} interview at ${school_name}.

Include:
1. Format-specific preparation strategies
2. Common questions and how to approach them
3. School-specific research points
4. Practice exercises
5. Day-of-interview logistics

Tailor the advice to the specific interview format and school if provided.`,
                },
              },
            ],
          };

        default:
          throw new Error(`Unknown prompt: ${name}`);
      }
    });

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'find-relevant-guidance',
            description: 'Find specific guidance from pre-med counseling resources',
            inputSchema: {
              type: 'object',
              properties: {
                topic: {
                  type: 'string',
                  description: 'The topic you need guidance on (e.g., MCAT prep, research, volunteering)',
                },
                student_situation: {
                  type: 'string',
                  description: 'Brief description of the student\'s current situation',
                },
              },
              required: ['topic'],
            },
          },
          {
            name: 'school-matcher',
            description: 'Match student profile to appropriate medical schools',
            inputSchema: {
              type: 'object',
              properties: {
                gpa: {
                  type: 'number',
                  description: 'Student\'s GPA',
                },
                mcat: {
                  type: 'number',
                  description: 'Student\'s MCAT score',
                },
                state: {
                  type: 'string',
                  description: 'State of residency',
                },
                preferences: {
                  type: 'string',
                  description: 'Any specific preferences (location, program type, etc.)',
                },
              },
              required: ['gpa', 'mcat', 'state'],
            },
          },
        ],
      };
    });

    // Execute tools
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'find-relevant-guidance':
          const { topic, student_situation = '' } = args;
          return {
            content: [
              {
                type: 'text',
                text: `Based on your question about "${topic}" and situation: "${student_situation}"

Here's relevant guidance from our pre-med counseling resources:

${this.getTopicGuidance(topic, student_situation)}`,
              },
            ],
          };

        case 'school-matcher':
          const { gpa, mcat, state, preferences = '' } = args;
          return {
            content: [
              {
                type: 'text',
                text: this.generateSchoolMatches(gpa, mcat, state, preferences),
              },
            ],
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  getTopicGuidance(topic, situation) {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('mcat')) {
      return `MCAT Preparation Guidance:
- Start 3-6 months before test date
- Use combination of prep books, practice tests, and review courses
- Focus on weak areas identified in diagnostic tests
- Take full-length practice tests under timed conditions
- Consider retaking if score is below target school ranges`;
    } else if (topicLower.includes('research')) {
      return `Research Experience Guidance:
- Start reaching out to faculty early in undergraduate career
- Look for opportunities in areas of interest
- Demonstrate commitment through sustained involvement
- Aim for meaningful contributions, not just hours
- Consider presenting at conferences or co-authoring publications`;
    } else if (topicLower.includes('volunteer') || topicLower.includes('clinical')) {
      return `Clinical Experience Guidance:
- Gain direct patient contact through volunteering or work
- Shadow physicians in various specialties
- Demonstrate long-term commitment to healthcare
- Reflect on experiences in applications and interviews
- Consider EMT, CNA, or medical scribe positions`;
    } else if (topicLower.includes('gap year')) {
      return `Gap Year Planning:
- Use time strategically to strengthen application
- Consider post-baccalaureate programs if GPA needs improvement
- Gain meaningful work or research experience
- Retake MCAT if needed
- Continue clinical and volunteer activities`;
    } else {
      return `General Pre-Med Guidance:
- Maintain strong academic performance
- Build diverse experiences (clinical, research, service, leadership)
- Develop meaningful relationships with mentors
- Start early with planning and preparation
- Stay committed to long-term goals while remaining flexible`;
    }
  }

  generateSchoolMatches(gpa, mcat, state, preferences) {
    let competitiveness = '';
    let schoolSuggestions = '';

    // Basic competitiveness assessment
    if (gpa >= 3.7 && mcat >= 515) {
      competitiveness = 'Highly competitive - excellent stats for top-tier schools';
      schoolSuggestions = `Reach Schools: Harvard, Johns Hopkins, UCSF, Washington University
Target Schools: Emory, Vanderbilt, Northwestern, Case Western
Safety Schools: State schools in ${state}, regional private schools`;
    } else if (gpa >= 3.5 && mcat >= 510) {
      competitiveness = 'Competitive - good stats for many medical schools';
      schoolSuggestions = `Target Schools: State schools in ${state}, mid-tier private schools
Safety Schools: Lower-tier state schools, DO schools
Reach Schools: Top-tier schools with mission fit`;
    } else if (gpa >= 3.2 && mcat >= 505) {
      competitiveness = 'Moderately competitive - consider broad application strategy';
      schoolSuggestions = `Focus on: State schools in ${state}, DO schools, Caribbean schools
Consider: Post-baccalaureate programs, MCAT retake
Safety Schools: Less competitive MD and DO programs`;
    } else {
      competitiveness = 'Below typical competitive range - consider strengthening application';
      schoolSuggestions = `Recommendations: 
- Consider post-baccalaureate program to improve GPA
- Retake MCAT if below 500
- Focus on DO schools and less competitive MD programs
- Consider gap year to strengthen application`;
    }

    return `Medical School Matching Analysis

Profile: GPA ${gpa}, MCAT ${mcat}, ${state} resident
Preferences: ${preferences}

Competitiveness Assessment: ${competitiveness}

School Recommendations:
${schoolSuggestions}

Application Strategy:
- Apply to 15-25 schools across all categories
- Submit applications early in cycle
- Strong personal statement highlighting your journey
- Letters of recommendation from clinical and academic mentors
- Demonstrate genuine interest in each school through research`;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Pre-Med Counseling MCP server running on stdio');
  }
}

const server = new PreMedCounselingServer();
server.run().catch(console.error);