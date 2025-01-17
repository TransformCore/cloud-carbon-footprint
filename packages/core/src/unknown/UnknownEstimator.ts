/*
 * © 2021 Thoughtworks, Inc.
 */

import { sum } from 'ramda'

import CloudConstants, {
  CloudConstantsEmissionsFactors,
} from '../CloudConstantsTypes'
import FootprintEstimate, {
  estimateCo2,
  KilowattHoursByServiceAndUsageUnit,
  KilowattHourTotals,
} from '../FootprintEstimate'
import IFootprintEstimator from '../IFootprintEstimator'
import UnknownUsage from './UnknownUsage'

export enum EstimateUnknownUsageBy {
  COST = 'cost',
  USAGE_AMOUNT = 'usageAmount',
}

export default class UnknownEstimator implements IFootprintEstimator {
  constructor(private estimateKilowattHoursBy: EstimateUnknownUsageBy) {}

  estimate(
    data: UnknownUsage[],
    region: string,
    emissionsFactors: CloudConstantsEmissionsFactors,
    constants: CloudConstants,
  ): FootprintEstimate[] {
    return data.map((data: UnknownUsage) => {
      const estimatedKilowattHours = this.estimateKilowattHours(
        data,
        constants.kilowattHoursByServiceAndUsageUnit,
      )
      const estimatedCo2eEmissions = estimateCo2(
        estimatedKilowattHours,
        region,
        emissionsFactors,
      )
      return {
        timestamp: data.timestamp,
        kilowattHours: estimatedKilowattHours,
        co2e: estimatedCo2eEmissions,
        usesAverageCPUConstant: false,
      }
    })
  }

  private estimateKilowattHours(
    unknownUsage: UnknownUsage,
    kilowattHoursByServiceAndUsageUnit: KilowattHoursByServiceAndUsageUnit,
  ): number {
    const serviceAndUsageUnit =
      kilowattHoursByServiceAndUsageUnit[unknownUsage.service] &&
      kilowattHoursByServiceAndUsageUnit[unknownUsage.service][
        unknownUsage.usageUnit
      ]

    if (serviceAndUsageUnit)
      return (
        (serviceAndUsageUnit.kilowattHours /
          serviceAndUsageUnit[this.estimateKilowattHoursBy]) *
        unknownUsage[this.estimateKilowattHoursBy]
      )

    const totalForUsageUnit =
      kilowattHoursByServiceAndUsageUnit.total[unknownUsage.usageUnit]

    if (totalForUsageUnit)
      return (
        (totalForUsageUnit.kilowattHours /
          totalForUsageUnit[this.estimateKilowattHoursBy]) *
        unknownUsage[this.estimateKilowattHoursBy]
      )
    const totalKiloWattHours = this.getTotalFor(
      'kilowattHours',
      kilowattHoursByServiceAndUsageUnit,
    )
    const totalCost = this.getTotalFor(
      this.estimateKilowattHoursBy,
      kilowattHoursByServiceAndUsageUnit,
    )

    return (
      (totalKiloWattHours / totalCost) *
      unknownUsage[this.estimateKilowattHoursBy]
    )
  }

  private getTotalFor(
    type: keyof KilowattHourTotals,
    kilowattHoursPerCost: KilowattHoursByServiceAndUsageUnit,
  ) {
    return sum(
      Object.values(kilowattHoursPerCost.total).map(
        (costAndKilowattHourTotals) => costAndKilowattHourTotals[type],
      ),
    )
  }
}
