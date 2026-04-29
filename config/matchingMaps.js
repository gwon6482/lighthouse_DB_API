// matching_logic.md 기반 매핑 테이블

// T1 성격 9요소 → PS 코드 매핑
// PS11(스트레스감내성)은 R(위험회피)과 역방향 → w 음수 처리
const T1_PS_MAP = {
  E: [{ code: 'PS13', w: 1.5 }, { code: 'PS14', w: 1.5 }, { code: 'PS08', w: 0.7 }],
  C: [{ code: 'PS09', w: 1.5 }, { code: 'PS05', w: 1.0 }, { code: 'PS06', w: 0.7 }],
  S: [{ code: 'PS02', w: 1.5 }, { code: 'PS03', w: 1.5 }, { code: 'PS04', w: 1.5 }, { code: 'PS07', w: 1.0 }, { code: 'PS08', w: 0.7 }],
  A: [{ code: 'PS01', w: 1.5 }, { code: 'PS12', w: 1.5 }, { code: 'PS15', w: 0.7 }],
  I: [{ code: 'PS05', w: 1.5 }, { code: 'PS09', w: 1.0 }, { code: 'PS02', w: 0.7 }, { code: 'PS16', w: 0.7 }],
  R: [{ code: 'PS03', w: 1.5 }, { code: 'PS06', w: 1.5 }, { code: 'PS10', w: 1.0 }, { code: 'PS11', w: -1.0 }],
  G: [{ code: 'PS12', w: 1.5 }, { code: 'PS01', w: 1.0 }, { code: 'PS13', w: 0.7 }],
  U: [{ code: 'PS16', w: 1.5 }, { code: 'PS14', w: 1.0 }, { code: 'PS07', w: 0.7 }, { code: 'PS10', w: 0.7 }, { code: 'PS15', w: 0.7 }],
  T: [{ code: 'PS01', w: 1.5 }, { code: 'PS13', w: 1.5 }, { code: 'PS12', w: 0.7 }],
};

// T21 재능 8요소 → AB(업무수행능력) 코드 매핑
const T21_AB_MAP = {
  L: [{ code: 'AB34', w: 1.5 }, { code: 'AB35', w: 1.5 }, { code: 'AB09', w: 1.0 }, { code: 'AB14', w: 1.0 }, { code: 'AB20', w: 0.7 }],
  M: [{ code: 'AB04', w: 1.5 }, { code: 'AB08', w: 1.5 }, { code: 'AB07', w: 1.0 }, { code: 'AB13', w: 1.0 }, { code: 'AB15', w: 0.7 }],
  S: [{ code: 'AB05', w: 1.5 }, { code: 'AB24', w: 1.0 }, { code: 'AB03', w: 0.7 }],
  A: [{ code: 'AB41', w: 1.5 }, { code: 'AB02', w: 0.7 }],
  B: [{ code: 'AB43', w: 1.5 }, { code: 'AB44', w: 1.5 }, { code: 'AB38', w: 1.0 }, { code: 'AB37', w: 1.0 }, { code: 'AB42', w: 0.7 }],
  I: [{ code: 'AB26', w: 1.5 }, { code: 'AB20', w: 1.5 }, { code: 'AB23', w: 1.0 }, { code: 'AB28', w: 1.0 }, { code: 'AB33', w: 0.7 }],
  N: [{ code: 'AB06', w: 1.5 }, { code: 'AB15', w: 1.0 }, { code: 'AB07', w: 0.7 }],
  T: [{ code: 'AB10', w: 1.5 }, { code: 'AB01', w: 1.5 }, { code: 'AB32', w: 1.0 }, { code: 'AB07', w: 0.7 }],
};

// T21 재능 8요소 → A(업무활동) 코드 매핑
const T21_A_MAP = {
  L: [{ code: 'A09', w: 1.5 }, { code: 'A10', w: 1.5 }, { code: 'A16', w: 1.0 }, { code: 'A25', w: 1.0 }, { code: 'A14', w: 0.7 }],
  M: [{ code: 'A05', w: 1.5 }, { code: 'A17', w: 1.5 }, { code: 'A07', w: 1.0 }, { code: 'A34', w: 0.7 }],
  S: [{ code: 'A03', w: 1.5 }, { code: 'A29', w: 1.5 }, { code: 'A11', w: 0.7 }],
  A: [{ code: 'A03', w: 1.0 }, { code: 'A04', w: 0.7 }],
  B: [{ code: 'A32', w: 1.5 }, { code: 'A40', w: 1.5 }, { code: 'A41', w: 1.0 }, { code: 'A36', w: 1.0 }, { code: 'A37', w: 0.7 }],
  I: [{ code: 'A19', w: 1.5 }, { code: 'A21', w: 1.5 }, { code: 'A22', w: 1.0 }, { code: 'A15', w: 1.0 }, { code: 'A08', w: 0.7 }],
  N: [{ code: 'A06', w: 1.5 }, { code: 'A12', w: 1.5 }, { code: 'A26', w: 0.7 }],
  T: [{ code: 'A04', w: 1.5 }, { code: 'A11', w: 1.5 }, { code: 'A24', w: 1.0 }, { code: 'A02', w: 0.7 }],
};

// T22 대분류 → Holland 유형 매핑
const T22_HOLLAND_MAP = {
  BUS: [{ code: 'E', w: 1.5 }, { code: 'C', w: 1.0 }],
  COM: [{ code: 'A', w: 1.5 }, { code: 'S', w: 1.0 }],
  EDU: [{ code: 'S', w: 1.5 }],
  SAF: [{ code: 'R', w: 1.5 }, { code: 'E', w: 0.7 }],
  SCI: [{ code: 'I', w: 1.5 }],
  SOC: [{ code: 'S', w: 1.5 }, { code: 'I', w: 1.0 }],
  TEC: [{ code: 'R', w: 1.5 }, { code: 'I', w: 1.0 }],
};

// T23 항목 → VA 코드 1:1 매핑
const T23_VA_MAP = {
  T23_1: 'VA10', T23_2: 'VA11', T23_3: 'VA04', T23_4: 'VA01',
  T23_5: 'VA06', T23_6: 'VA09', T23_7: 'VA05', T23_8: 'VA12',
  T23_9: 'VA07', T23_10: 'VA08', T23_11: 'VA03', T23_12: 'VA13', T23_13: 'VA02',
};

// T23 우선순위 가중치
const T23_WEIGHTS = { priority_1: 1.5, priority_2: 1.0, priority_3: 0.7 };

module.exports = { T1_PS_MAP, T21_AB_MAP, T21_A_MAP, T22_HOLLAND_MAP, T23_VA_MAP, T23_WEIGHTS };
