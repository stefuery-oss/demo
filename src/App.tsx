import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@zendeskgarden/react-buttons';
import { Field, Input, Select, Textarea, Toggle } from '@zendeskgarden/react-forms';
import { Col, Grid, Row } from '@zendeskgarden/react-grid';
import { Close, Notification, Title as NotificationTitle, useToast, Well } from '@zendeskgarden/react-notifications';
import { LG, MD, Paragraph, SM, XL, XXL } from '@zendeskgarden/react-typography';
import summaryIcon from '@zendeskgarden/svg-icons/src/16/clipboard-list-stroke.svg';
import notesIcon from '@zendeskgarden/svg-icons/src/16/notes-stroke.svg';
import valueIcon from '@zendeskgarden/svg-icons/src/16/line-graph-stroke.svg';
import healthIcon from '@zendeskgarden/svg-icons/src/16/heart-stroke.svg';
import draftIcon from '@zendeskgarden/svg-icons/src/16/email-stroke.svg';
import savingsIcon from '@zendeskgarden/svg-icons/src/16/bar-chart-stroke.svg';
import settingsIcon from '@zendeskgarden/svg-icons/src/16/gear-stroke.svg';

const MVP_DATE = '2026-05-07';
const STORAGE_KEY = 'csmOs.savedOutputs';

type Screen = 'home' | 'form' | 'output' | 'settings';
type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea';
type FormValues = Record<string, string>;

interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  defaultValue?: string;
  min?: number;
}

interface WorkflowConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  primaryLabel: string;
  fields: FieldConfig[];
  generateOutput: (values: FormValues) => string;
}

interface GeneratedOutput {
  workflowId: string;
  workflowTitle: string;
  text: string;
}

interface StoredOutput extends GeneratedOutput {
  timestamp: string;
}

const workflowConfigs: WorkflowConfig[] = [
  {
    id: 'executive_summary',
    title: 'Executive Summary',
    description: 'Create a Gainsight cover page summary.',
    icon: summaryIcon,
    primaryLabel: 'Generate Executive Summary',
    fields: [
      { name: 'customerName', label: 'Customer name', type: 'text', required: true, defaultValue: 'Acme Retail' },
      { name: 'healthScore', label: 'CSM Health Score', type: 'number', required: true, defaultValue: '82', min: 0 },
      {
        name: 'accountStatus',
        label: 'Account status',
        type: 'select',
        required: true,
        options: ['On track', 'Watchlist', 'At risk'],
        defaultValue: 'On track'
      },
      {
        name: 'openRiskCta',
        label: 'Open Risk CTA present',
        type: 'select',
        options: ['Yes', 'No'],
        defaultValue: 'No'
      },
      { name: 'keyActivities', label: 'Key activities', type: 'textarea', defaultValue: 'Quarterly review completed.' },
      { name: 'risks', label: 'Risks and concerns', type: 'textarea', defaultValue: 'No material risks shared.' },
      { name: 'nextSteps', label: 'Next steps', type: 'textarea', defaultValue: 'Confirm adoption goals and owners.' }
    ],
    generateOutput: values =>
      [
        `Date: ${MVP_DATE}`,
        'Prepared by: Stephen Fuery',
        `Exec Summary: ${values.customerName} is ${values.accountStatus}. Key activities: ${values.keyActivities || 'Placeholder activities pending.'} Risks and concerns: ${values.risks || 'Placeholder risks pending.'} Open Risk CTA present: ${values.openRiskCta || 'No'}.`,
        `CSM Health Score: ${values.healthScore}`,
        `Account Status: ${values.accountStatus}`,
        `Next Steps: ${values.nextSteps || 'Placeholder next steps pending.'}`
      ].join('\n')
  },
  {
    id: 'success_call_notes',
    title: 'Success Call Notes',
    description: 'Turn meeting notes into the standard template.',
    icon: notesIcon,
    primaryLabel: 'Generate Success Call Notes',
    fields: [
      { name: 'clientName', label: 'Client name', type: 'text', required: true, defaultValue: 'Acme Retail' },
      { name: 'meetingDate', label: 'Meeting date', type: 'date', required: true, defaultValue: MVP_DATE },
      { name: 'attendees', label: 'Attendees', type: 'text', required: true, defaultValue: 'Stephen Fuery, Jane Customer' },
      { name: 'purpose', label: 'Purpose of call', type: 'textarea', defaultValue: 'Review adoption and agree next actions.' },
      { name: 'notes', label: 'Notes', type: 'textarea', defaultValue: 'Team discussed recent support volume and enablement needs.' },
      { name: 'decisions', label: 'Decisions', type: 'textarea', defaultValue: 'Focus on knowledge base quality this month.' },
      { name: 'nextSteps', label: 'Next steps', type: 'textarea', defaultValue: 'Share follow up plan and confirm owners.' }
    ],
    generateOutput: values =>
      [
        `${values.clientName} Success Call – Notes`,
        '',
        `Date: ${values.meetingDate}`,
        `Attendees: ${values.attendees}`,
        '',
        'Summary:',
        values.purpose || 'Placeholder call summary pending.',
        '',
        'Key Points:',
        `${values.notes || 'Placeholder notes pending.'}${values.decisions ? `\nDecisions: ${values.decisions}` : ''}`,
        '',
        'Next Steps & Owners:',
        values.nextSteps || 'Placeholder next steps and owners pending.'
      ].join('\n')
  },
  {
    id: 'value_statement',
    title: 'Value Statement',
    description: 'Estimate cost per contact and value narrative.',
    icon: valueIcon,
    primaryLabel: 'Generate Value Statement',
    fields: [
      { name: 'customerName', label: 'Customer name', type: 'text', required: true, defaultValue: 'Acme Retail' },
      { name: 'annualTicketVolume', label: 'Annual ticket volume', type: 'number', required: true, defaultValue: '120000', min: 0 },
      { name: 'agents', label: 'Number of agents', type: 'number', required: true, defaultValue: '85', min: 0 },
      { name: 'location', label: 'Location', type: 'text', required: true, defaultValue: 'United States' },
      { name: 'averageSalary', label: 'Average agent salary', type: 'number', defaultValue: '65000', min: 0 },
      {
        name: 'subscriptionTier',
        label: 'Subscription tier',
        type: 'select',
        options: ['', 'Suite Team', 'Suite Growth', 'Suite Professional', 'Suite Enterprise'],
        defaultValue: ''
      },
      { name: 'notes', label: 'Notes', type: 'textarea', defaultValue: 'Use benchmark assumptions in the next version.' }
    ],
    generateOutput: values =>
      [
        'Input Summary',
        `Customer name: ${values.customerName}`,
        `Annual ticket volume: ${values.annualTicketVolume}`,
        `Number of agents: ${values.agents}`,
        `Location: ${values.location}`,
        `Average agent salary: ${values.averageSalary || 'Placeholder'}`,
        `Subscription tier: ${values.subscriptionTier || 'Placeholder'}`,
        `Notes: ${values.notes || 'Placeholder notes pending.'}`,
        '',
        'Cost per Contact',
        'Placeholder calculation will go here.',
        '',
        'Value Statement',
        `${values.customerName} has an opportunity to connect support volume, team capacity, and customer experience goals into a clearer value narrative. Placeholder quantified value will go here.`
      ].join('\n')
  },
  {
    id: 'ahs',
    title: 'AHS',
    description: 'Draft an account health summary.',
    icon: healthIcon,
    primaryLabel: 'Generate AHS Summary',
    fields: [
      { name: 'customerName', label: 'Customer name', type: 'text', required: true, defaultValue: 'Acme Retail' },
      { name: 'previousNotes', label: 'Previous health check notes', type: 'textarea', defaultValue: 'Adoption was steady with moderate executive engagement.' },
      { name: 'changes', label: 'What has changed since last health check', type: 'textarea', defaultValue: 'New reporting cadence started.' },
      {
        name: 'plannedGrade',
        label: 'Planned colour grade',
        type: 'select',
        required: true,
        options: ['Green', 'Yellow', 'Orange', 'Red'],
        defaultValue: 'Green'
      },
      { name: 'riskCtaDetails', label: 'If not Green, Risk CTA details', type: 'textarea', defaultValue: '' },
      { name: 'notes', label: 'Notes', type: 'textarea', defaultValue: 'Keep summary concise.' }
    ],
    generateOutput: values =>
      [
        'Executive Summary',
        `${values.customerName} is currently planned as ${values.plannedGrade}. ${values.changes || 'No major changes were provided.'}`,
        `Previous view: ${values.previousNotes || 'Placeholder previous health notes pending.'}`,
        values.plannedGrade === 'Green'
          ? 'Risk CTA: Not required based on the planned grade.'
          : `Risk CTA: ${values.riskCtaDetails || 'Placeholder Risk CTA details pending.'}`,
        `Notes: ${values.notes || 'Placeholder notes pending.'}`
      ].join('\n')
  },
  {
    id: 'communications_draft',
    title: 'Communications draft',
    description: 'Draft an internal or external message.',
    icon: draftIcon,
    primaryLabel: 'Generate Draft',
    fields: [
      {
        name: 'audience',
        label: 'Internal or external',
        type: 'select',
        required: true,
        options: ['Internal', 'External'],
        defaultValue: 'Internal'
      },
      {
        name: 'channel',
        label: 'Channel',
        type: 'select',
        required: true,
        options: ['Email', 'Slack', 'Teams', 'Other'],
        defaultValue: 'Email'
      },
      {
        name: 'tone',
        label: 'Tone',
        type: 'select',
        required: true,
        options: ['Strict', 'Firm', 'Neutral', 'Friendly', 'Very friendly'],
        defaultValue: 'Neutral'
      },
      { name: 'goal', label: 'Goal', type: 'textarea', required: true, defaultValue: 'Align stakeholders on next actions.' },
      { name: 'keyPoints', label: 'Key points', type: 'textarea', defaultValue: 'Share context, ask for confirmation, propose owners.' },
      { name: 'existingDraft', label: 'Existing draft', type: 'textarea', defaultValue: '' }
    ],
    generateOutput: values =>
      [
        `Tone: ${values.tone}`,
        ...(values.channel === 'Email' ? [`Subject: ${values.goal}`] : []),
        '',
        `${values.audience} ${values.channel} draft`,
        '',
        values.existingDraft || 'Hi team,',
        '',
        `Goal: ${values.goal}`,
        `Key points: ${values.keyPoints || 'Placeholder key points pending.'}`,
        '',
        'Next action: Please review and confirm the owner.'
      ].join('\n')
  },
  {
    id: 'savings_calculation',
    title: 'Savings calculation',
    description: 'Estimate monthly and annual savings.',
    icon: savingsIcon,
    primaryLabel: 'Calculate Savings',
    fields: [
      { name: 'customerName', label: 'Customer name', type: 'text', required: true, defaultValue: 'Acme Retail' },
      { name: 'costPerContact', label: 'Current cost per contact', type: 'number', required: true, defaultValue: '8.5', min: 0 },
      { name: 'annualTicketVolume', label: 'Annual ticket volume', type: 'number', required: true, defaultValue: '120000', min: 0 },
      {
        name: 'improvementArea',
        label: 'Improvement area',
        type: 'select',
        required: true,
        options: ['Self service', 'One touch resolution', 'Deflection', 'Agent efficiency', 'Channel shift'],
        defaultValue: 'Self service'
      },
      { name: 'improvementPercent', label: 'Expected improvement percent', type: 'number', required: true, defaultValue: '10', min: 0 },
      { name: 'notes', label: 'Notes', type: 'textarea', defaultValue: 'Placeholder calculation for MVP validation.' }
    ],
    generateOutput: values => {
      const annualVolume = Number(values.annualTicketVolume) || 0;
      const costPerContact = Number(values.costPerContact) || 0;
      const improvementPercent = Number(values.improvementPercent) || 0;
      const annualSavings = annualVolume * costPerContact * (improvementPercent / 100);
      const monthlySavings = annualSavings / 12;
      const currency = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      });

      return [
        'Savings Calculation',
        `Customer name: ${values.customerName}`,
        `Improvement area: ${values.improvementArea}`,
        `Current cost per contact: ${currency.format(costPerContact)}`,
        `Annual ticket volume: ${annualVolume.toLocaleString()}`,
        `Expected improvement percent: ${improvementPercent}%`,
        '',
        `Monthly savings: ${currency.format(monthlySavings)}`,
        `Annual savings: ${currency.format(annualSavings)}`,
        '',
        `Notes: ${values.notes || 'Placeholder notes pending.'}`
      ].join('\n');
    }
  }
];

const workflowById = new Map(workflowConfigs.map(workflow => [workflow.id, workflow]));

function createInitialValues(workflow: WorkflowConfig): FormValues {
  return workflow.fields.reduce<FormValues>((values, field) => {
    values[field.name] = field.defaultValue ?? '';
    return values;
  }, {});
}

function formatFileName(workflowTitle: string) {
  return `${workflowTitle.toLowerCase().replace(/\s+/g, '_')}_${MVP_DATE.replace(/-/g, '_')}.txt`;
}

function saveOutputLocally(output: GeneratedOutput) {
  const existingRaw = window.localStorage.getItem(STORAGE_KEY);
  const existing: StoredOutput[] = existingRaw ? JSON.parse(existingRaw) : [];
  const next: StoredOutput[] = [
    {
      ...output,
      timestamp: new Date().toISOString()
    },
    ...existing
  ].slice(0, 10);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(workflowConfigs[0].id);
  const [formValues, setFormValues] = useState<FormValues>(() => createInitialValues(workflowConfigs[0]));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<GeneratedOutput | null>(null);
  const [rememberOutputs, setRememberOutputs] = useState(false);
  const { addToast } = useToast();

  const selectedWorkflow = useMemo(
    () => workflowById.get(selectedWorkflowId) ?? workflowConfigs[0],
    [selectedWorkflowId]
  );

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    addToast(
      ({ close }) => (
        <Notification type={type}>
          <NotificationTitle>{message}</NotificationTitle>
          <Close aria-label="Close" onClick={close} />
        </Notification>
      ),
      { placement: 'top-end', autoDismiss: 3000 }
    );
  };

  const openWorkflow = (workflow: WorkflowConfig) => {
    setSelectedWorkflowId(workflow.id);
    setFormValues(createInitialValues(workflow));
    setErrors({});
    setScreen('form');
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    selectedWorkflow.fields.forEach(field => {
      if (field.required && !String(formValues[field.name] ?? '').trim()) {
        nextErrors[field.name] = 'This field is required';
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const nextOutput: GeneratedOutput = {
      workflowId: selectedWorkflow.id,
      workflowTitle: selectedWorkflow.title,
      text: selectedWorkflow.generateOutput(formValues)
    };

    setOutput(nextOutput);

    if (rememberOutputs) {
      saveOutputLocally(nextOutput);
    }

    setScreen('output');
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(output.text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = output.text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      showToast('Copied to clipboard');
    } catch {
      showToast('Copy failed', 'error');
    }
  };

  const saveToFile = () => {
    if (!output) {
      return;
    }

    const blob = new Blob([output.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = formatFileName(output.workflowTitle);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearSavedOutputs = () => {
    if (!rememberOutputs) {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    showToast('Saved outputs cleared');
  };

  return (
    <div className="app-shell">
      <header className="top-bar">
        <button className="brand-button" type="button" onClick={() => setScreen('home')}>
          CSM OS
        </button>
        <Button isBasic onClick={() => setScreen('settings')}>
          <img src={settingsIcon} alt="" className="button-icon" />
          Settings
        </Button>
      </header>

      <main>
        {screen === 'home' && <HomeScreen onSelectWorkflow={openWorkflow} />}
        {screen === 'settings' && (
          <SettingsScreen
            rememberOutputs={rememberOutputs}
            onRememberChange={setRememberOutputs}
            onClearSavedOutputs={clearSavedOutputs}
            onBack={() => setScreen('home')}
          />
        )}
        {screen === 'form' && (
          <WorkflowForm
            workflow={selectedWorkflow}
            values={formValues}
            errors={errors}
            onChange={(name, value) => setFormValues(current => ({ ...current, [name]: value }))}
            onSubmit={handleSubmit}
            onBack={() => setScreen('home')}
          />
        )}
        {screen === 'output' && (
          <OutputScreen
            output={output}
            onCopy={copyOutput}
            onSave={saveToFile}
            onBack={() => setScreen(output ? 'form' : 'home')}
          />
        )}
      </main>
    </div>
  );
}

function HomeScreen({ onSelectWorkflow }: { onSelectWorkflow: (workflow: WorkflowConfig) => void }) {
  return (
    <section className="page page-wide">
      <div className="page-heading">
        <XXL tag="h1">CSM OS</XXL>
        <MD tag="p" className="subheading">
          Select a workflow
        </MD>
      </div>

      <Grid gutters="md">
        <Row>
          {workflowConfigs.map(workflow => (
            <Col key={workflow.id} xs={12} md={6} lg={4}>
              <button className="workflow-card" type="button" onClick={() => onSelectWorkflow(workflow)}>
                <span className="workflow-icon">
                  <img src={workflow.icon} alt="" />
                </span>
                <LG tag="span">{workflow.title}</LG>
                <Paragraph>{workflow.description}</Paragraph>
              </button>
            </Col>
          ))}
        </Row>
      </Grid>
    </section>
  );
}

function SettingsScreen({
  rememberOutputs,
  onRememberChange,
  onClearSavedOutputs,
  onBack
}: {
  rememberOutputs: boolean;
  onRememberChange: (value: boolean) => void;
  onClearSavedOutputs: () => void;
  onBack: () => void;
}) {
  return (
    <section className="page">
      <div className="page-heading">
        <XL tag="h1">Settings</XL>
      </div>

      <Well>
        <Field className="toggle-row">
          <Toggle
            id="rememberOutputs"
            checked={rememberOutputs}
            onChange={event => onRememberChange(event.target.checked)}
          />
          <div>
            <Field.Label htmlFor="rememberOutputs">Remember last 10 outputs locally</Field.Label>
            <Field.Hint>Saved outputs stay on this Mac only.</Field.Hint>
          </div>
        </Field>
      </Well>

      <div className="action-row">
        <Button onClick={onBack}>Back to Home</Button>
        <Button isPrimary disabled={!rememberOutputs} onClick={onClearSavedOutputs}>
          Clear saved outputs
        </Button>
      </div>
    </section>
  );
}

function WorkflowForm({
  workflow,
  values,
  errors,
  onChange,
  onSubmit,
  onBack
}: {
  workflow: WorkflowConfig;
  values: FormValues;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}) {
  return (
    <section className="page">
      <div className="page-heading">
        <XL tag="h1">{workflow.title}</XL>
        <Paragraph>{workflow.description}</Paragraph>
      </div>

      <form onSubmit={onSubmit} noValidate>
        <Well>
          <div className="form-grid">
            {workflow.fields.map(field => (
              <FormField
                key={field.name}
                field={field}
                value={values[field.name] ?? ''}
                error={errors[field.name]}
                onChange={value => onChange(field.name, value)}
              />
            ))}
          </div>
        </Well>

        <div className="action-row">
          <Button type="button" onClick={onBack}>
            Back to Home
          </Button>
          <Button type="submit" isPrimary>
            {workflow.primaryLabel}
          </Button>
        </div>
      </form>
    </section>
  );
}

function FormField({
  field,
  value,
  error,
  onChange
}: {
  field: FieldConfig;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const inputId = `field-${field.name}`;
  const validation = error ? 'error' : undefined;

  return (
    <Field>
      <Field.Label htmlFor={inputId}>
        {field.label}
        {field.required ? <span className="required-marker"> required</span> : null}
      </Field.Label>

      {field.type === 'textarea' && (
        <Textarea
          id={inputId}
          value={value}
          minRows={4}
          validation={validation}
          onChange={event => onChange(event.target.value)}
        />
      )}

      {field.type === 'select' && (
        <Select
          id={inputId}
          value={value}
          validation={validation}
          onChange={event => onChange(event.target.value)}
        >
          {field.options?.map(option => (
            <option key={option || 'blank'} value={option}>
              {option || 'Select one'}
            </option>
          ))}
        </Select>
      )}

      {(field.type === 'text' || field.type === 'number' || field.type === 'date') && (
        <Input
          id={inputId}
          type={field.type}
          value={value}
          min={field.min}
          validation={validation}
          onChange={event => onChange(event.target.value)}
        />
      )}

      {error ? (
        <Field.Message validation="error" validationLabel="Error">
          {error}
        </Field.Message>
      ) : null}
    </Field>
  );
}

function OutputScreen({
  output,
  onCopy,
  onSave,
  onBack
}: {
  output: GeneratedOutput | null;
  onCopy: () => void;
  onSave: () => void;
  onBack: () => void;
}) {
  return (
    <section className="page">
      <div className="page-heading">
        <XL tag="h1">Output</XL>
        {output ? <SM tag="p">{output.workflowTitle}</SM> : null}
      </div>

      <Well isRecessed>
        <pre className="output-panel">{output?.text || 'No output generated yet.'}</pre>
      </Well>

      <div className="action-row">
        <Button type="button" onClick={onBack}>
          Back
        </Button>
        <Button type="button" disabled={!output} onClick={onSave}>
          Save to file
        </Button>
        <Button type="button" isPrimary disabled={!output} onClick={onCopy}>
          Copy Output
        </Button>
      </div>
    </section>
  );
}

export default App;
