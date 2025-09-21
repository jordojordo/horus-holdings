import type {
  RecurrencePayload,
  SimpleRecurrence,
  RecurrenceKind,
  WeekendAdjustment,
} from '@/types/Recurrence';

import { useEffect, useMemo, useState } from 'react';
import {
  Tabs,
  DatePicker,
  Select,
  InputNumber,
  Space,
  Typography,
  Button,
  Tag,
  Divider,
  Input,
  message,
} from 'antd';
import dayjs from 'dayjs';
import axios from 'axios';

const { Text } = Typography;

type Props = {
  value?: RecurrencePayload;
  onChange: (value: RecurrencePayload) => void;
  previewApiBase?: string; // e.g., `${apiUrl}/api/v1`
};

const defaultTZ =
  Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';

const defaultPayload: RecurrencePayload = {
  recurrenceKind:    'none',
  anchorDate:        dayjs().format('YYYY-MM-DD'),
  timezone:          defaultTZ,
  weekendAdjustment: 'none',
  includeDates:      [],
  excludeDates:      [],
};

export default function RecurrenceBuilder({
  value,
  onChange,
  previewApiBase = '',
}: Props) {
  const [payload, setPayload] = useState<RecurrencePayload>(
    value || defaultPayload
  );
  const [preview, setPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    onChange(payload);
  }, [payload, onChange]);

  const previewWindow = useMemo(
    () => ({
      start: dayjs().format('YYYY-MM-DD'),
      end:   dayjs().add(120, 'day').format('YYYY-MM-DD'),
    }),
    []
  );

  useEffect(() => {}, [payload, previewApiBase, previewWindow]);

  async function doPreview() {
    try {
      setLoading(true);

      const { data } = await axios.post(
        `${ previewApiBase }/recurrence/preview`,
        {
          payload,
          window: previewWindow,
        }
      );

      setPreview(data.dates || []);
    } catch (e) {
      console.warn(e);
      message.error('Failed to preview recurrence');
    } finally {
      setLoading(false);
    }
  }

  function setKind(kind: RecurrenceKind) {
    setPayload((p) => ({
      ...p,
      recurrenceKind: kind,
    }));
  }

  function setSimple(s: SimpleRecurrence) {
    setPayload((p) => ({
      ...p,
      recurrenceKind: 'simple',
      simple:         s,
      rrule:          undefined,
    }));
  }

  function setAnchor(d: string | null) {
    setPayload((p) => ({
      ...p,
      anchorDate: d || dayjs().format('YYYY-MM-DD'),
    }));
  }

  function setEnd(d: string | null) {
    setPayload((p) => ({
      ...p,
      endDate: d || null,
    }));
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space wrap>
        <DatePicker
          value={payload.anchorDate ? dayjs(payload.anchorDate) : null}
          onChange={(d) => setAnchor(d ? d.format('YYYY-MM-DD') : null)}
          placeholder="Anchor date"
        />
        <DatePicker
          value={payload.endDate ? dayjs(payload.endDate) : null}
          onChange={(d) => setEnd(d ? d.format('YYYY-MM-DD') : null)}
          placeholder="End date (optional)"
        />
        <Select
          style={{ minWidth: 220 }}
          value={payload.timezone || defaultTZ}
          onChange={(tz) => setPayload((p) => ({
              ...p,
              timezone: tz,
            }))
          }
          options={[
            {
              label: defaultTZ,
              value: defaultTZ,
            },
            {
              label: 'America/New_York',
              value: 'America/New_York',
            },
            {
              label: 'UTC',
              value: 'UTC',
            },
          ]}
        />
        <Select
          style={{ minWidth: 180 }}
          value={payload.weekendAdjustment || 'none'}
          onChange={(v: WeekendAdjustment) => setPayload((p) => ({
              ...p,
              weekendAdjustment: v,
            }))
          }
          options={[
            {
              label: 'No weekend adjustment',
              value: 'none',
            },
            {
              label: 'Move to next business day',
              value: 'next',
            },
            {
              label: 'Move to previous business day',
              value: 'prev',
            },
            {
              label: 'Move to nearest business day',
              value: 'nearest',
            },
          ]}
        />
      </Space>

      <Tabs
        activeKey={payload.recurrenceKind}
        onChange={(k) => setKind(k as RecurrenceKind)}
        items={[
          {
            key:      'none',
            label:    'One-off',
            children: (
              <Text type="secondary">
                This will use the Anchor Date as the due date.
              </Text>
            ),
          },
          {
            key:      'simple',
            label:    'Simple',
            children: (
              <Space
                direction="vertical"
                size="small"
                style={{ width: '100%' }}
              >
                <Space wrap>
                  <Select
                    style={{ minWidth: 220 }}
                    placeholder="Pattern"
                    onChange={(pattern: string) => {
                      if (pattern === 'weekly') {
                        setSimple({
                          type:       'weekly',
                          daysOfWeek: [],
                        });
                      }
                      if (pattern === 'everyNDays') {
                        setSimple({
                          type: 'everyNDays',
                          n:    2,
                        });
                      }
                      if (pattern === 'biweekly') {
                        setSimple({ type: 'biweekly' });
                      }
                      if (pattern === 'monthlyDay') {
                        setSimple({
                          type: 'monthlyDay',
                          day:  1,
                        });
                      }
                      if (pattern === 'monthlyOrdinal') {
                        setSimple({
                          type:    'monthlyOrdinal',
                          ordinal: 1,
                          weekday: 4,
                        });
                      }
                      if (pattern === 'semiMonthly') {
                        setSimple({
                          type: 'semiMonthly',
                          days: [1, 15],
                        });
                      }
                      if (pattern === 'quarterly') {
                        setSimple({
                          type: 'quarterly',
                          day:  1,
                        });
                      }
                      if (pattern === 'semiannual') {
                        setSimple({
                          type:      'semiannual',
                          monthDays: [
                            {
                              month: 1,
                              day:   1,
                            },
                            {
                              month: 7,
                              day:   1,
                            },
                          ],
                        });
                      }
                      if (pattern === 'annual') {
                        setSimple({
                          type:  'annual',
                          month: 1,
                          day:   1,
                        });
                      }
                      if (pattern === 'customDays') {
                        setSimple({
                          type: 'customDays',
                          days: [1, 15],
                        });
                      }
                    }}
                    options={[
                      {
                        label: 'Weekly',
                        value: 'weekly',
                      },
                      {
                        label: 'Every N Days',
                        value: 'everyNDays',
                      },
                      {
                        label: 'Bi-weekly',
                        value: 'biweekly',
                      },
                      {
                        label: 'Monthly (by day)',
                        value: 'monthlyDay',
                      },
                      {
                        label: 'Monthly (ordinal weekday)',
                        value: 'monthlyOrdinal',
                      },
                      {
                        label: 'Semi-monthly (two days)',
                        value: 'semiMonthly',
                      },
                      {
                        label: 'Quarterly',
                        value: 'quarterly',
                      },
                      {
                        label: 'Semi-annual',
                        value: 'semiannual',
                      },
                      {
                        label: 'Annual',
                        value: 'annual',
                      },
                      {
                        label: 'Custom month days',
                        value: 'customDays',
                      },
                    ]}
                  />
                  {payload.simple?.type === 'weekly' && (
                    <Space>
                      <InputNumber
                        min={1}
                        defaultValue={1}
                        onChange={(v) => setSimple({
                            type:     'weekly',
                            interval: Number(v || 1),
                            daysOfWeek:
                              payload.simple?.type === 'weekly' ? payload.simple.daysOfWeek : [],
                          })
                        }
                        addonBefore="Every"
                        addonAfter="weeks"
                      />
                      <Select
                        mode="multiple"
                        style={{ minWidth: 260 }}
                        placeholder="Days of week"
                        onChange={(days: number[]) => setSimple({
                            type:       'weekly',
                            interval:   (payload.simple as { type: 'weekly'; interval?: number; daysOfWeek: number[] })?.interval || 1,
                            daysOfWeek: days,
                          })
                        }
                        options={[
                          {
                            label: 'Sun',
                            value: 0,
                          },
                          {
                            label: 'Mon',
                            value: 1,
                          },
                          {
                            label: 'Tue',
                            value: 2,
                          },
                          {
                            label: 'Wed',
                            value: 3,
                          },
                          {
                            label: 'Thu',
                            value: 4,
                          },
                          {
                            label: 'Fri',
                            value: 5,
                          },
                          {
                            label: 'Sat',
                            value: 6,
                          },
                        ]}
                      />
                    </Space>
                  )}
                  {payload.simple?.type === 'everyNDays' && (
                    <InputNumber
                      min={1}
                      value={(payload.simple as { type: 'everyNDays'; n: number }).n}
                      onChange={(v) => setSimple({
                          type: 'everyNDays',
                          n:    Number(v || 1),
                        })
                      }
                      addonBefore="Every"
                      addonAfter="days"
                    />
                  )}
                  {payload.simple?.type === 'biweekly' && (
                    <Text>
                      Bi-weekly on same weekday as Anchor Date (or choose in
                      Advanced later).
                    </Text>
                  )}
                  {payload.simple?.type === 'monthlyDay' && (
                    <InputNumber
                      min={1}
                      max={31}
                      value={(payload.simple as { type: 'monthlyDay'; day: number }).day}
                      onChange={(v) => setSimple({
                          type: 'monthlyDay',
                          day:  Number(v || 1),
                        })
                      }
                      addonBefore="Day of month"
                    />
                  )}
                  {payload.simple?.type === 'monthlyOrdinal' && (
                    <Space>
                      <Select
                        value={(payload.simple as { type: 'monthlyOrdinal'; ordinal: 1|2|3|4|-1; weekday: 0|1|2|3|4|5|6 }).ordinal}
                        onChange={(ord) => setSimple({
                            type:    'monthlyOrdinal',
                            ordinal: ord,
                            weekday: (payload.simple as { type: 'monthlyOrdinal'; ordinal: 1|2|3|4|-1; weekday: 0|1|2|3|4|5|6 })?.weekday,
                          })
                        }
                        options={[
                          {
                            label: '1st',
                            value: 1,
                          },
                          {
                            label: '2nd',
                            value: 2,
                          },
                          {
                            label: '3rd',
                            value: 3,
                          },
                          {
                            label: '4th',
                            value: 4,
                          },
                          {
                            label: 'Last',
                            value: -1,
                          },
                        ]}
                      />
                      <Select
                        value={(payload.simple as { type: 'monthlyOrdinal'; ordinal: 1|2|3|4|-1; weekday: 0|1|2|3|4|5|6 }).weekday}
                        onChange={(wd) => setSimple({
                            type:    'monthlyOrdinal',
                            ordinal: (payload.simple as { type: 'monthlyOrdinal'; ordinal: 1|2|3|4|-1; weekday: 0|1|2|3|4|5|6 }).ordinal,
                            weekday: wd,
                          })
                        }
                        options={[
                          {
                            label: 'Sun',
                            value: 0,
                          },
                          {
                            label: 'Mon',
                            value: 1,
                          },
                          {
                            label: 'Tue',
                            value: 2,
                          },
                          {
                            label: 'Wed',
                            value: 3,
                          },
                          {
                            label: 'Thu',
                            value: 4,
                          },
                          {
                            label: 'Fri',
                            value: 5,
                          },
                          {
                            label: 'Sat',
                            value: 6,
                          },
                        ]}
                      />
                    </Space>
                  )}
                  {payload.simple?.type === 'semiMonthly' && (
                    <Space>
                      <InputNumber
                        min={1}
                        max={31}
                        value={(payload.simple as { type: 'semiMonthly'; days: [number, number] }).days[0]}
                        onChange={(v) => setSimple({
                            type: 'semiMonthly',
                            days: [
                              Number(v || 1),
                              (payload.simple as { type: 'semiMonthly'; days: [number, number] }).days[1],
                            ],
                          })
                        }
                      />
                      <InputNumber
                        min={1}
                        max={31}
                        value={(payload.simple as { type: 'semiMonthly'; days: [number, number] }).days[1]}
                        onChange={(v) => setSimple({
                            type: 'semiMonthly',
                            days: [
                              (payload.simple as { type: 'semiMonthly'; days: [number, number] }).days[0],
                              Number(v || 1),
                            ],
                          })
                        }
                      />
                    </Space>
                  )}
                  {payload.simple?.type === 'quarterly' && (
                    <InputNumber
                      min={1}
                      max={31}
                      value={(payload.simple as { type: 'quarterly'; day: number }).day}
                      onChange={(v) => setSimple({
                          type: 'quarterly',
                          day:  Number(v || 1),
                        })
                      }
                      addonBefore="Day of month"
                    />
                  )}
                  {payload.simple?.type === 'semiannual' && (
                    <Text type="secondary">
                      Preset months are Jan 1 and Jul 1. Use Advanced (RRULE)
                      for arbitrary selections.
                    </Text>
                  )}
                  {payload.simple?.type === 'annual' && (
                    <Space>
                      <InputNumber
                        min={1}
                        max={12}
                        value={(payload.simple as { type: 'annual'; month: number; day: number }).month}
                        onChange={(v) => setSimple({
                            type:  'annual',
                            month: Number(v || 1),
                            day:   (payload.simple as { type: 'annual'; month: number; day: number }).day,
                          })
                        }
                        addonBefore="Month"
                      />
                      <InputNumber
                        min={1}
                        max={31}
                        value={(payload.simple as { type: 'annual'; month: number; day: number }).day}
                        onChange={(v) => setSimple({
                            type:  'annual',
                            month: (payload.simple as { type: 'annual'; month: number; day: number }).month,
                            day:   Number(v || 1),
                          })
                        }
                        addonBefore="Day"
                      />
                    </Space>
                  )}
                  {payload.simple?.type === 'customDays' && (
                    <Input
                      placeholder="e.g. 1, 15, 28"
                      onBlur={(e) => {
                        const parts = e.target.value
                          .split(',')
                          .map((s) => Number(s.trim()))
                          .filter(Boolean);

                        setSimple({
                          type: 'customDays',
                          days: parts,
                        });
                      }}
                    />
                  )}
                </Space>
              </Space>
            ),
          },
          {
            key:      'rrule',
            label:    'Advanced (RRULE)',
            children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text type="secondary">
                  Paste iCalendar RRULE here. You may include multiple RRULE
                  lines and an optional DTSTART line.
                </Text>
                <Input.TextArea
                  rows={6}
                  value={payload.rrule || ''}
                  onChange={(e) => setPayload((p) => ({
                      ...p,
                      recurrenceKind: 'rrule',
                      rrule:          e.target.value,
                    }))
                  }
                  placeholder="DTSTART:20250101T000000
RRULE:FREQ=MONTHLY;BYMONTHDAY=1
RRULE:FREQ=MONTHLY;BYMONTHDAY=15"
                />
              </Space>
            ),
          },
        ]}
      />

      <Divider />
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button onClick={doPreview} loading={loading}>
          Preview next dates
        </Button>
        <Space wrap>
          {preview.slice(0, 12).map((d) => (
            <Tag key={d}>{d}</Tag>
          ))}
        </Space>
      </Space>
    </Space>
  );
}
